"use client";

interface Props {
  page: number;          // zero-based
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

/** Compact prev / next pager with "x–y of n" readout. */
export default function Pager({ page, totalPages, totalCount, pageSize, onChange, disabled }: Props) {
  if (totalCount === 0) return null;
  const from = page * pageSize + 1;
  const to = Math.min(totalCount, (page + 1) * pageSize);
  const btn = "text-[13px] font-sans font-semibold uppercase tracking-[0.16em] px-4 py-2 border border-border text-charcoal hover:border-navy hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-charcoal";
  return (
    <div className="flex items-center justify-between gap-4 mt-6">
      <p className="text-[14px] font-sans text-muted">
        Showing <span className="text-charcoal font-medium">{from}–{to}</span> of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={disabled || page === 0} onClick={() => onChange(page - 1)}>← Prev</button>
        <span className="text-[13px] font-sans text-muted px-2">Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <button type="button" className={btn} disabled={disabled || page + 1 >= totalPages} onClick={() => onChange(page + 1)}>Next →</button>
      </div>
    </div>
  );
}
