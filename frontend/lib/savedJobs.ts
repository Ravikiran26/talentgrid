/**
 * Saved jobs — persisted on the backend (/api/saved-jobs).
 * Any ids left over from the old localStorage-only version are pushed to the
 * server once, then the local copy is removed.
 */
import { api } from "./api";
import { normalizeJob } from "./jobs";
import type { Job } from "@/types";

const LEGACY_KEY = "tg_saved_jobs";

async function migrateLegacy(): Promise<void> {
  if (typeof window === "undefined") return;
  let ids: string[] = [];
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    ids = JSON.parse(raw) as string[];
  } catch { return; }
  await Promise.allSettled(ids.map((id) => api.post(`/api/saved-jobs/${encodeURIComponent(id)}`, {})));
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
}

export async function fetchSavedJobIds(): Promise<string[]> {
  await migrateLegacy();
  try {
    const ids = await api.get<number[]>("/api/saved-jobs/ids");
    return ids.map(String);
  } catch {
    return [];
  }
}

export async function fetchSavedJobs(): Promise<Job[]> {
  await migrateLegacy();
  try {
    const raw = await api.get<Record<string, unknown>[]>("/api/saved-jobs");
    return raw.map(normalizeJob);
  } catch {
    return [];
  }
}

export async function saveJob(jobId: string): Promise<void> {
  await api.post(`/api/saved-jobs/${encodeURIComponent(jobId)}`, {});
}

export async function unsaveJob(jobId: string): Promise<void> {
  await api.delete(`/api/saved-jobs/${encodeURIComponent(jobId)}`);
}

/** Returns the new saved state. */
export async function toggleSavedJob(jobId: string, currentlySaved: boolean): Promise<boolean> {
  if (currentlySaved) { await unsaveJob(jobId); return false; }
  await saveJob(jobId);
  return true;
}
