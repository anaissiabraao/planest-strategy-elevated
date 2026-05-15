const ALLOWED_ORIGIN_EXACT = new Set<string>([
  "https://planest.com.br",
  "https://www.planest.com.br",
  "https://planest-teste.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGIN_EXACT.has(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:" && protocol !== "http:") return false;
    if (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovable.dev")) return true;
    if (hostname === "planest.com.br" || hostname.endsWith(".planest.com.br")) return true;
    return false;
  } catch {
    return false;
  }
}

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = isAllowedOrigin(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}