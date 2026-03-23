import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a IA de atendimento do Planest — um sistema de planejamento estratégico feito para consultores.

Seu objetivo é responder dúvidas sobre o Planest e levar o potencial cliente a conhecer e contratar o sistema.

Informações sobre o Planest:
- Sistema completo de planejamento estratégico para consultores
- Módulos: Canvas (BMC, BMY, Persona, Lean Canvas), Diagnóstico (SWOT, setores, riscos), Análise de cenário (GUT), Mapa Estratégico (BSC, OKR), Indicadores KPI (FCA), Projetos (5W2H, Ágil, GANTT, PMBOK), Relatórios completos, Controle de Acesso (LGPD)
- Funcionalidades: Whitelabel, Chat de atendimento integrado, IA integrada, treinamento EAD, mais de 18 tipos de consultorias
- Substitui planilhas por um processo estruturado e escalável
- Ideal para pequenas/médias empresas e consultores
- Contato: (47) 99950-7669
- Site: https://www.planest.com.br/saas/

Diretrizes:
- Seja amigável, profissional e direto
- Responda em português brasileiro
- Destaque benefícios práticos
- Quando apropriado, sugira que o cliente acesse o sistema ou agende uma demonstração
- Seja conciso nas respostas (máximo 3-4 frases por resposta)
- Não invente funcionalidades que não existem`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
