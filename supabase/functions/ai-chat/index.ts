import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://planest-teste.lovable.app",
  "https://www.planest.com.br",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

// Simple in-memory rate limiter (per-instance, resets on cold start)
const ipRequests = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const ALLOWED_ROLES = new Set(["user", "assistant"]);
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const MAX_BODY_SIZE = 50_000; // ~50KB

const SYSTEM_PROMPT = `Você é a IA de atendimento do Planest — um sistema de planejamento estratégico feito para consultores.

Seu objetivo é responder dúvidas sobre o Planest e levar o potencial cliente a conhecer e contratar o sistema.

Informações sobre o Planest:
- Sistema completo de planejamento estratégico para consultores
- Módulos: Canvas (BMC, BMY, Persona, Lean Canvas), Diagnóstico (SWOT, setores, riscos), Análise de cenário (GUT), Mapa Estratégico (BSC, OKR), Indicadores KPI (FCA), Projetos (5W2H, Ágil, GANTT, PMBOK), Relatórios completos, Controle de Acesso (LGPD)
- Funcionalidades: Whitelabel, Chat de atendimento integrado, IA integrada, treinamento EAD, mais de 18 tipos de consultorias
- Substitui planilhas por um processo estruturado e escalável
- Ideal para pequenas/médias empresas e consultores
- Contato: (47) 99950-7669
- Site: https://saas.planest.com.br/

Diretrizes:
- Seja amigável, profissional e direto
- Responda em português brasileiro
- Destaque benefícios práticos
- Quando apropriado, sugira que o cliente acesse o sistema ou agende uma demonstração
- Seja conciso nas respostas (máximo 3-4 frases por resposta)
- Não invente funcionalidades que não existem`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Body size check
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: "Payload muito grande." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { messages } = body;

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Formato de mensagens inválido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and validate each message
    const sanitizedMessages = [];
    for (const msg of messages) {
      if (!msg || typeof msg.content !== "string" || typeof msg.role !== "string") {
        return new Response(
          JSON.stringify({ error: "Mensagem com formato inválido." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!ALLOWED_ROLES.has(msg.role)) {
        continue; // skip disallowed roles silently
      }
      sanitizedMessages.push({
        role: msg.role,
        content: msg.content.slice(0, MAX_CONTENT_LENGTH),
      });
    }

    if (sanitizedMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhuma mensagem válida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          ...sanitizedMessages,
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
