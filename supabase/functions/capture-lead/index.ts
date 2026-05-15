import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  source: z.enum(["section_inline", "modal_exit", "whatsapp_form", "blog", "outro"]).default("section_inline"),
  page: z.string().max(300).optional(),
  referrer: z.string().max(500).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now > e.reset) { hits.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  e.count += 1; return e.count > 10;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
    if (rateLimited(ip)) return new Response(JSON.stringify({ ok: false, error: "rate_limited" }), { status: 429, headers: { ...cors, "Content-Type": "application/json" } });

    const json = await req.json().catch(() => ({}));
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ ok: false, error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const data = parsed.data;
    const insert = { ...data, email: data.email || null };
    const { error, data: row } = await supabase.from("leads").insert(insert).select("id").single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: row.id }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as Error).message) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});