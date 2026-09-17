/**
 * Candidate account data that used to be mocked: subscription, notifications, job stats.
 * Every function fails soft so a backend hiccup never blanks the UI.
 */
import { api } from "./api";

export interface SubscriptionInfo {
  plan: "FREE" | "PRO";
  active: boolean;
  renewsOn: string | null;          // ISO instant when PRO expires
  applicationsThisMonth: number;
  applicationLimit: number | null;  // null = unlimited
}

export const FREE_SUBSCRIPTION: SubscriptionInfo = {
  plan: "FREE", active: false, renewsOn: null, applicationsThisMonth: 0, applicationLimit: 3,
};

export interface NotificationItem {
  id: number;
  type: "APPLICATION_RECEIVED" | "APPLICATION_STATUS" | "ACCOUNT_STATUS" | "SUBSCRIPTION";
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationFeed {
  items: NotificationItem[];
  unreadCount: number;
}

export interface JobStats {
  activeJobs: number;
  companies: number;
  cities: number;
  categories: number;
  newThisWeek: { label: string; count: number }[];
}

export function formatRenewsOn(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export async function fetchSubscription(): Promise<SubscriptionInfo> {
  try { return await api.get<SubscriptionInfo>("/api/subscription/me"); }
  catch { return FREE_SUBSCRIPTION; }
}

export function upgradeSubscription(): Promise<SubscriptionInfo> {
  return api.post<SubscriptionInfo>("/api/subscription/upgrade", {});
}

export function cancelSubscription(): Promise<SubscriptionInfo> {
  return api.post<SubscriptionInfo>("/api/subscription/cancel", {});
}

export async function fetchNotifications(): Promise<NotificationFeed> {
  try { return await api.get<NotificationFeed>("/api/notifications"); }
  catch { return { items: [], unreadCount: 0 }; }
}

export async function markAllNotificationsRead(): Promise<void> {
  try { await api.post("/api/notifications/read-all", {}); } catch { /* ignore */ }
}

export async function fetchJobStats(): Promise<JobStats | null> {
  try { return await api.get<JobStats>("/api/jobs/stats"); }
  catch { return null; }
}
