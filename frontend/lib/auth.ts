export type CandidateStatus = "ACTIVE" | "UNDER_REVIEW" | "REJECTED";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: "CANDIDATE" | "ADMIN" | "EMPLOYER";
  status: CandidateStatus;
}

const TOKEN_KEY = "tg_token";
const USER_KEY  = "tg_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
