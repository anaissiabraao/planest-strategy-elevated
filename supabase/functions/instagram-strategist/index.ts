import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const SYSTEM = `Você é estrategista de Instagram para a Planest, um SaaS brasileiro de planejamento estratégico voltado para PMEs e consultores.
Foco absoluto: gerar posts que levem o seguidor para o funil (testar grátis, falar com especialista, baixar material).
Use 5 pilares: educacional, case, prova_social, cta, bastidores.
Devolva JSON válido seguindo o schema. Conteúdo em pt-BR.`;

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

    const body = await req.json().catch(() => ({}));
    const days = Math.min(14, Math.max(1, Number(body.days) || 7));
    const focus = String(body.focus || "Gerar leads qualificados para o trial Planest");

    const userMsg = `Gere um plano de ${days} posts (1 por dia) para o Instagram com foco em: ${focus}.

Para cada post devolva no JSON:
{
  "posts": [
    {
      "day_offset": número (0 = hoje, 1 = amanhã...),
      "pillar": "educacional|case|prova_social|cta|bastidores",
      "caption": "legenda completa pronta para publicar (200-600 chars), com 1 CTA claro",
      "hashtags": "string com 8-12 hashtags relevantes em pt-BR",
      "goal_metric": "métrica principal a observar (ex: salvamentos, cliques no link da bio, DMs)",
      "visual_idea": "descrição curta do visual (carrossel, reels, foto, etc)"
    }
  ]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}` },
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
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];

    const now = new Date();
    const rows = posts.slice(0, days).map((p: any) => {
      const offset = Number(p.day_offset) || 0;
      const when = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
      when.setHours(10, 0, 0, 0);
      const allowedPillars = ["educacional","case","prova_social","cta","bastidores"];
      const pillar = allowedPillars.includes(p.pillar) ? p.pillar : "educacional";
      return {
        caption: String(p.caption || "").slice(0, 2200),
        hashtags: String(p.hashtags || "").slice(0, 500),
        pillar,
        goal_metric: String(p.goal_metric || "").slice(0, 200) + (p.visual_idea ? ` • Visual: ${p.visual_idea}` : ""),
        scheduled_for: when.toISOString(),
        status: "idea",
        ai_generated: true,
      };
    });

    if (rows.length) await supabase.from("instagram_posts").insert(rows);
    return new Response(JSON.stringify({ ok: true, created: rows.length }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});