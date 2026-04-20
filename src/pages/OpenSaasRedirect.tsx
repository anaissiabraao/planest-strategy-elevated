import { useEffect } from "react";
import { buildSaasUrl, SAAS_URL } from "@/lib/openSaas";

const SAAS_ORIGIN = new URL(SAAS_URL).origin;

function clearWebStorage() {
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    // noop
  }
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
}

function clearAllCookies() {
  const names = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim())
    .filter(Boolean) as string[];

  const host = window.location.hostname;
  const domains = Array.from(
    new Set([
      undefined,
      host,
      `.${host}`,
      "planest.com.br",
      ".planest.com.br",
      "saas.planest.com.br",
      ".saas.planest.com.br",
    ])
  ) as Array<string | undefined>;

  names.forEach((name) => {
    expireCookie(name);
    domains.forEach((domain) => expireCookie(name, domain));
  });
}

async function clearServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch {
    // noop
  }
}

export default function OpenSaasRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTarget = params.get("target");
    const safeTarget = requestedTarget?.startsWith(SAAS_ORIGIN) ? requestedTarget : buildSaasUrl();

    void (async () => {
      clearWebStorage();
      clearAllCookies();
      await clearServiceWorkers();

      window.setTimeout(() => {
        window.location.replace(safeTarget);
      }, 120);
    })();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center space-y-3 max-w-md">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Redirecionando</p>
        <h1 className="font-heading text-3xl font-bold">Abrindo o sistema com uma sessão limpa</h1>
        <p className="text-muted-foreground">Aguarde um instante enquanto eliminamos conflitos de cache e cookies.</p>
      </div>
    </main>
  );
}