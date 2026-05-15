import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const SYSTEM = `Você é um coach de vendas SaaS B2B em pt-BR para a Planest (planejamento estratégico para PMEs e consultores).
Sua missão: aumentar conversão de leads. Tom: direto, consultivo, sem jargão de vendinha.
Sempre devolva JSON válido conforme o schema. Não invente dados que não foram fornecidos.`;

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    const { data: staffOk } = await supabase.rpc("is_staff", { _user_id: user.id });
    if (!staffOk) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const { lead_id } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: "lead_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const { data: lead } = await supabase.from("leads").select("*").eq("id", lead_id).maybeSingle();
    if (!lead) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    const { data: notes } = await supabase.from("lead_notes").select("body, kind, created_at").eq("lead_id", lead_id).order("created_at");

    const userMsg = `Lead:
Nome: ${lead.name}
Telefone: ${lead.phone}
E-mail: ${lead.email || "—"}
Origem: ${lead.source}
Status atual: ${lead.status}
UTM: ${lead.utm_source || "—"} / ${lead.utm_medium || "—"} / ${lead.utm_campaign || "—"}
Página: ${lead.page || "—"}
Histórico de interações:
${(notes || []).map(n => `- [${n.kind}] ${n.body}`).join("\n") || "Sem notas ainda."}

Analise e devolva JSON com:
{
  "score": número 0-100 (probabilidade de conversão),
  "intent": string curta (intenção percebida),
  "next_best_action": string (próxima ação concreta para o vendedor agora),
  "suggested_message": string (mensagem pronta em pt-BR para enviar via WhatsApp, máx 600 chars, tom Planest),
  "objectives": array de exatamente 3 strings com metas SMART para evoluir esse lead
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI error ${aiRes.status}`, detail: txt }), { status: aiRes.status, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const update = {
      ai_score: score,
      ai_intent: String(parsed.intent || "").slice(0, 300),
      ai_next_action: String(parsed.next_best_action || "").slice(0, 600),
      ai_suggested_message: String(parsed.suggested_message || "").slice(0, 1500),
      ai_objectives: Array.isArray(parsed.objectives) ? parsed.objectives.slice(0, 5) : [],
    };
    await supabase.from("leads").update(update).eq("id", lead_id);
    await supabase.from("lead_notes").insert({
      lead_id, author_id: user.id, kind: "ai",
      body: `Análise IA — score ${score}\nIntenção: ${update.ai_intent}\nPróxima ação: ${update.ai_next_action}`,
    });

    return new Response(JSON.stringify({ ok: true, ...update }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});