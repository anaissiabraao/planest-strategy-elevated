import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SESSION_KEY = "planest_session_hash";
const SENT_KEY = "planest_tracked_paths";

function getSessionHash(): string {
  let h = sessionStorage.getItem(SESSION_KEY);
  if (!h) {
    h = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, h);
  }
  return h;
}

function getSentSet(): Set<string> {
  try { return new Set(JSON.parse(sessionStorage.getItem(SENT_KEY) || "[]")); }
  catch { return new Set(); }
}
function pushSent(s: Set<string>) {
  sessionStorage.setItem(SENT_KEY, JSON.stringify(Array.from(s)));
}

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    const sent = getSentSet();
    if (sent.has(path)) return;
    sent.add(path);
    pushSent(sent);

    const params = new URLSearchParams(location.search);
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-pageview`;
    const payload = {
      path: location.pathname,
      referrer: document.referrer || null,
      session_hash: getSessionHash(),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    };
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    // GA4
    const gaId = import.meta.env.VITE_GA4_ID as string | undefined;
    if (gaId && (window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_path: location.pathname });
    }
  }, [location.pathname, location.search]);
}