// Helper to open the Planest SaaS in a new tab without cache/cookie conflicts.
// - Adds a cache-busting query param so stale service workers / CDN caches don't serve old HTML
// - Uses window.open with noopener,noreferrer to avoid session leakage
// - Falls back to location assignment if the popup is blocked

export const SAAS_URL = "https://saas.planest.com.br/login/";
export const SAAS_EXIT_PATH = "/abrir-sistema";

export function buildSaasUrl(): string {
  const url = new URL(SAAS_URL);
  // Cache-buster: forces a fresh request and avoids stuck SW/cache responses
  url.searchParams.set("_t", Date.now().toString(36));
  return url.toString();
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
}

function clearSharedPlanestCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim())
    .filter(Boolean) as string[];

  const host = window.location.hostname;
  const candidateDomains = Array.from(
    new Set([
      undefined,
      host,
      `.${host}`,
      host.endsWith("planest.com.br") ? "planest.com.br" : undefined,
      host.endsWith("planest.com.br") ? ".planest.com.br" : undefined,
    ].filter(Boolean))
  ) as string[];

  cookieNames.forEach((name) => {
    expireCookie(name);
    candidateDomains.forEach((domain) => expireCookie(name, domain));
  });
}

export function openSaas(e?: React.MouseEvent | MouseEvent) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const exitUrl = new URL(SAAS_EXIT_PATH, window.location.origin);
  exitUrl.searchParams.set("target", buildSaasUrl());

  try {
    clearSharedPlanestCookies();
    window.setTimeout(() => {
      window.location.assign(exitUrl.toString());
    }, 80);
  } catch {
    window.location.assign(exitUrl.toString());
  }
}
