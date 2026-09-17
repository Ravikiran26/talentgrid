"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { fetchNotifications, markAllNotificationsRead, type NotificationFeed } from "@/lib/account";

/** Header bell for any signed-in user. Refetches whenever `refreshKey` changes (e.g. route). */
export default function NotificationBell({ refreshKey }: { refreshKey: string }) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<NotificationFeed>({ items: [], unreadCount: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications().then(setFeed);
  }, [refreshKey]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && feed.unreadCount > 0) {
      markAllNotificationsRead().then(() =>
        setFeed((f) => ({ items: f.items.map((n) => ({ ...n, read: true })), unreadCount: 0 })));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={toggle}
        className="relative text-muted hover:text-charcoal transition-colors" aria-label="Notifications">
        <Bell className="w-[18px] h-[18px]" />
        {feed.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] bg-brass rounded-full" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-surface border border-border shadow-lg max-h-[420px] overflow-y-auto z-50">
          <p className="px-4 py-3 text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted border-b border-border">
            Notifications
          </p>
          {feed.items.length === 0 ? (
            <p className="px-4 py-5 text-[14.5px] font-sans text-muted">You&apos;re all caught up.</p>
          ) : feed.items.map((n) => (
            <Link key={n.id} href={n.link ?? "/"} onClick={() => setOpen(false)}
              className={`block px-4 py-3 border-b border-border last:border-b-0 hover:bg-ivory transition-colors ${n.read ? "" : "bg-highlight"}`}>
              <p className="text-[14.5px] font-sans text-charcoal leading-snug">{n.message}</p>
              <p className="text-[12.5px] font-sans text-muted mt-1">{formatRelativeDate(n.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
