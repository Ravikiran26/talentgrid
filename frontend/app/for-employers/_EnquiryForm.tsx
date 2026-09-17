"use client";

const inputCls = "w-full px-4 py-3 text-[15px] font-sans text-charcoal placeholder-muted-light bg-ivory border border-border focus:outline-none focus:border-navy transition-colors duration-150";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-sans font-semibold uppercase tracking-[0.2em] text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EnquiryForm() {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Your Name">
          <input type="text" placeholder="Priya Sharma" className={inputCls} />
        </Field>
        <Field label="Company">
          <input type="text" placeholder="Infosys, Wipro…" className={inputCls} />
        </Field>
      </div>
      <Field label="Work Email">
        <input type="email" placeholder="you@company.com" className={inputCls} />
      </Field>
      <Field label="Role You're Hiring For">
        <input type="text" placeholder="e.g. Senior Project Manager" className={inputCls} />
      </Field>
      <Field label="Tell Us More (optional)">
        <textarea rows={4} placeholder="Location, experience level, team size, timeline…"
          className={`${inputCls} resize-none`} />
      </Field>
      <div className="pt-1">
        <button type="submit"
          className="w-full py-3.5 text-[13px] font-sans font-semibold uppercase tracking-[0.22em] text-surface bg-navy hover:bg-navy-mid transition-colors duration-150 focus:outline-none">
          Submit Enquiry →
        </button>
        <p className="mt-3 text-[13px] font-sans text-muted text-center">
          We respond within one business day.
        </p>
      </div>
    </form>
  );
}
