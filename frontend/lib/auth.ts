export type CandidateStatus = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "ADMIN" | "EMPLOYER";
  status: CandidateStatus;
  authProvider?: "LOCAL" | "GOOGLE" | "LINKEDIN";
}

const TOKEN_KEY = "tg_token";
const USER_KEY  = "tg_user";
/** Non-sensitive role hint so the server can pick the right `/` screen without a flash. */
export const ROLE_COOKIE = "tg_role";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function syncRoleCookie(user: AuthUser | null): void {
  if (typeof document === "undefined") return;
  document.cookie = user
    ? `${ROLE_COOKIE}=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
    : `${ROLE_COOKIE}=; path=/; max-age=0`;
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  syncRoleCookie(user);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  syncRoleCookie(null);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
