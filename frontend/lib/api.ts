import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** The message plus any per-field validation errors, e.g. "Validation failed: title size must be between 0 and 200". */
  get detail(): string {
    const fields = (this.data as { fields?: Record<string, string> } | undefined)?.fields;
    if (!fields || Object.keys(fields).length === 0) return this.message;
    return `${this.message}: ${Object.entries(fields).map(([f, m]) => `${f} ${m}`).join("; ")}`;
  }
}

/** 204 and other empty responses resolve to undefined instead of failing to parse. */
async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch { data = {}; }
    const msg =
      (data as Record<string, string>)?.message ??
      `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, msg, data);
  }

  return parseBody<T>(res);
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
}

async function requestPage<T>(path: string, options?: RequestInit): Promise<PagedResult<T>> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch { data = {}; }
    const msg =
      (data as Record<string, string>)?.message ??
      `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, msg, data);
  }

  const items = (await res.json()) as T[];
  const totalCount = Number(res.headers.get("X-Total-Count") ?? items.length);
  const totalPages = Number(res.headers.get("X-Total-Pages") ?? 1);
  return { items, totalCount, totalPages };
}

async function requestMultipart<T>(
  path: string,
  method: "POST" | "PUT",
  formData: FormData,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch { data = {}; }
    const msg =
      (data as Record<string, string>)?.message ??
      `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, msg, data);
  }

  return parseBody<T>(res);
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: "GET", ...options }),

  getPage: <T>(path: string, options?: RequestInit) =>
    requestPage<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...options }),

  upload: <T>(path: string, formData: FormData) =>
    requestMultipart<T>(path, "POST", formData),

  downloadBlob: async (path: string): Promise<Blob> => {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let data: unknown;
      try { data = await res.json(); } catch { data = {}; }
      const msg =
        (data as Record<string, string>)?.message ??
        `${res.status} ${res.statusText}`;
      throw new ApiError(res.status, msg, data);
    }
    return res.blob();
  },
};
