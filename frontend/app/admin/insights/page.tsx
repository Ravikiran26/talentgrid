"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatPublished, type Insight } from "@/lib/insights";

interface Form { title: string; slug: string; category: string; readTime: string; excerpt: string; body: string; published: boolean }
const BLANK: Form = { title: "", slug: "", category: "", readTime: "", excerpt: "", body: "", published: true };

export default function AdminInsightsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Insight | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setItems(await api.get<Insight[]>("/api/admin/insights")); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "ADMIN") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [router, load]);

  async function togglePublished(a: Insight) {
    try {
      await api.patch(`/api/admin/insights/${a.id}`, {
        title: a.title, slug: a.slug, category: a.category, readTime: a.readTime,
        excerpt: a.excerpt, body: a.body, published: !a.published,
      });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Update failed"); }
  }

  async function remove(a: Insight) {
    try { await api.delete(`/api/admin/insights/${a.id}`); setConfirmDelete(null); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-navy border-b border-navy-border">
        <div className="h-[2px] bg-brass" />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.3em] text-brass mb-1">Admin Dashboard</p>
            <h1 className="font-serif text-3xl font-bold text-surface">Career Insights</h1>
            <p className="text-[15px] font-sans text-navy-text mt-1">{items.length} {items.length === 1 ? "article" : "articles"} · {items.filter((i) => i.published).length} published</p>
          </div>
          <button type="button" onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] bg-brass text-navy px-6 py-3 hover:bg-brass/90 transition-colors self-start sm:self-auto">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-8">
        {error && (
          <p className="mb-4 flex items-center gap-2 text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4" />{error}
          </p>
        )}
        {loading ? (
          <p className="text-[15px] font-sans text-muted py-16 text-center">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-[15px] font-sans text-muted bg-surface border border-border p-10 text-center">No articles yet.</p>
        ) : (
          <div className="bg-surface border border-border divide-y divide-border">
            {items.map((a) => (
              <div key={a.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-brass">{a.category} · {a.readTime} · {formatPublished(a.publishedAt)}</p>
                  <p className="font-serif text-[1.16rem] font-semibold text-navy leading-snug mt-0.5">{a.title}</p>
                  <p className="text-[14px] font-sans text-muted mt-0.5 truncate">/insights/{a.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-sans font-bold uppercase tracking-[0.16em] px-2 py-1 border ${a.published ? "text-green-700 border-green-200 bg-green-50" : "text-muted border-border"}`}>
                    {a.published ? "Published" : "Draft"}
                  </span>
                  {a.published && (
                    <Link href={`/insights/${a.slug}`} target="_blank" className="p-2 text-muted hover:text-navy" aria-label="View"><Eye className="w-4 h-4" /></Link>
                  )}
                  <button type="button" onClick={() => togglePublished(a)} className="p-2 text-muted hover:text-navy" aria-label={a.published ? "Unpublish" : "Publish"}>
                    {a.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button type="button" onClick={() => { setEditing(a); setShowForm(true); }} className="p-2 text-muted hover:text-navy" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => setConfirmDelete(a)} className="p-2 text-muted hover:text-red-600" aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <InsightForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-navy/60 flex items-center justify-center px-4">
          <div className="bg-surface border border-border p-7 max-w-sm w-full">
            <p className="font-serif text-[1.32rem] font-semibold text-navy">Delete this article?</p>
            <p className="mt-2 text-[15px] font-sans text-muted">“{confirmDelete.title}” will be removed permanently.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => remove(confirmDelete)} className="flex-1 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-surface bg-red-600 hover:bg-red-700">Delete</button>
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.16em] text-charcoal border border-border hover:bg-ivory">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightForm({ initial, onClose, onSaved }: { initial: Insight | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Form>(initial ? {
    title: initial.title, slug: initial.slug, category: initial.category, readTime: initial.readTime,
    excerpt: initial.excerpt, body: initial.body ?? "", published: initial.published,
  } : BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === "published" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      if (initial) await api.patch(`/api/admin/insights/${initial.id}`, form);
      else await api.post("/api/admin/insights", form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  const input = "w-full px-4 py-2.5 text-[15px] font-sans text-charcoal bg-white border border-input focus:outline-none focus:border-navy";
  const label = "block text-[12px] font-sans font-semibold uppercase tracking-[0.18em] text-muted mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-navy/60 flex items-start justify-center px-4 py-8 overflow-y-auto">
      <form onSubmit={submit} className="bg-surface border border-border w-full max-w-2xl p-8 space-y-5">
        <p className="font-serif text-[1.54rem] font-semibold text-navy">{initial ? "Edit article" : "New article"}</p>
        {error && <p className="text-[14px] font-sans text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
        <div><label className={label}>Title</label><input className={input} value={form.title} onChange={set("title")} required /></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={label}>Category</label><input className={input} value={form.category} onChange={set("category")} required /></div>
          <div><label className={label}>Read time</label><input className={input} value={form.readTime} onChange={set("readTime")} placeholder="auto" /></div>
          <div><label className={label}>Slug</label><input className={input} value={form.slug} onChange={set("slug")} placeholder="from title" /></div>
        </div>
        <div><label className={label}>Excerpt</label><textarea className={input} rows={2} value={form.excerpt} onChange={set("excerpt")} required /></div>
        <div>
          <label className={label}>Body</label>
          <textarea className={`${input} font-mono text-[14.5px]`} rows={14} value={form.body} onChange={set("body")} required />
          <p className="mt-1 text-[13px] font-sans text-muted">Blank line between paragraphs. Start a line with <code>## </code> for a heading.</p>
        </div>
        <label className="flex items-center gap-2 text-[15px] font-sans text-charcoal">
          <input type="checkbox" checked={form.published} onChange={set("published")} /> Published
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-7 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-surface bg-navy hover:bg-navy-mid disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
          <button type="button" onClick={onClose} className="px-7 py-3 text-[13px] font-sans font-semibold uppercase tracking-[0.18em] text-charcoal border border-border hover:bg-ivory">Cancel</button>
        </div>
      </form>
    </div>
  );
}
