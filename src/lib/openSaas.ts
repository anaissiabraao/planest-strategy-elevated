// Helper to open the Planest SaaS in a new tab without cache/cookie conflicts.
// - Adds a cache-busting query param so stale service workers / CDN caches don't serve old HTML
// - Uses window.open with noopener,noreferrer to avoid session leakage
// - Falls back to location assignment if the popup is blocked

export const SAAS_URL = "https://saas.planest.com.br/";

export function buildSaasUrl(): string {
  const url = new URL(SAAS_URL);
  // Cache-buster: forces a fresh request and avoids stuck SW/cache responses
  url.searchParams.set("_t", Date.now().toString(36));
  return url.toString();
}

export function openSaas(e?: React.MouseEvent | MouseEvent) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const target = buildSaasUrl();
  try {
    window.location.assign(target);
  } catch {
    window.location.href = target;
  }
}
