interface BadgeProps {
  children: React.ReactNode;
  variant?: "skill" | "category" | "type";
}

export default function Badge({ children, variant = "skill" }: BadgeProps) {
  const cls = {
    skill:    "inline-flex items-center px-2.5 py-0.5 text-[11px] font-sans bg-[#EDE8DF] text-charcoal border border-border",
    category: "inline-flex items-center text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-brass",
    type:     "inline-flex items-center px-2.5 py-0.5 text-[11px] font-sans text-muted border border-border",
  }[variant];

  return <span className={cls}>{children}</span>;
}
