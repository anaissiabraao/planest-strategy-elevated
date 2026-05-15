import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Naive in-memory rate limit (per cold start)
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  e.count += 1;
  return e.count > 60;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
    if (rateLimited(ip)) return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const path = String(body.path || "/").slice(0, 500);
    const referrer = body.referrer ? String(body.referrer).slice(0, 500) : null;
    const session_hash = body.session_hash ? String(body.session_hash).slice(0, 128) : null;
    const utm_source = body.utm_source ? String(body.utm_source).slice(0, 100) : null;
    const utm_medium = body.utm_medium ? String(body.utm_medium).slice(0, 100) : null;
    const utm_campaign = body.utm_campaign ? String(body.utm_campaign).slice(0, 100) : null;
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;
    const user_agent = req.headers.get("user-agent")?.slice(0, 300) || null;

    const { error } = await supabase.from("page_views").insert({
      path, referrer, session_hash, utm_source, utm_medium, utm_campaign, country, user_agent,
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});