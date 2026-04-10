// Cookie utility functions

export function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Cookie consent
export function hasConsentCookie(): boolean {
  return getCookie('cookie_consent') !== null;
}

export function getConsent(): boolean {
  return getCookie('cookie_consent') === 'accepted';
}

export function setConsent(accepted: boolean) {
  setCookie('cookie_consent', accepted ? 'accepted' : 'rejected', 365);
}

// Session persistence
export function setFormCompleted(completed: boolean) {
  if (getConsent()) {
    setCookie('form_completed', completed ? 'true' : 'false', 30);
  }
}

export function hasCompletedForm(): boolean {
  return getCookie('form_completed') === 'true';
}

export function setUserSessionData(key: string, value: string) {
  if (getConsent()) {
    setCookie(`session_${key}`, value, 30);
  }
}

export function getUserSessionData(key: string): string | null {
  return getCookie(`session_${key}`);
}
