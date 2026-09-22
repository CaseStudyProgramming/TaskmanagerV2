import type { Session } from '../model/session';

export function setSessionToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function getSessionToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function clearSessionToken(): void {
  localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
  const token = getSessionToken();
  return token !== null && token.length > 0;
}

export function setSessionData(session: Session): void {
  localStorage.setItem('auth_session', JSON.stringify(session));
}

export function getSessionData(): Session | null {
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr) as Session;
  } catch {
    return null;
  }
}

export function clearSessionData(): void {
  localStorage.removeItem('auth_session');
}
