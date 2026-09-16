import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size    = "sm" | "md" | "lg";

interface Base {
  variant?: Variant; size?: Size; className?: string; children: React.ReactNode;
}
interface Btn  extends Base { href?: undefined; onClick?: () => void; type?: "button"|"submit"|"reset"; disabled?: boolean; }
interface Lnk  extends Base { href: string; onClick?: undefined; type?: undefined; disabled?: undefined; }
type Props = Btn | Lnk;

const V: Record<Variant, string> = {
  primary:   "bg-navy text-surface hover:bg-navy-mid border border-navy",
  secondary: "bg-brass text-surface hover:bg-brass-light border border-brass",
  outline:   "bg-transparent text-charcoal border border-border hover:bg-ivory",
  ghost:     "bg-transparent text-muted hover:text-charcoal border border-transparent",
};
const S: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px] tracking-[0.14em]",
  md: "px-6 py-2.5 text-[11px] tracking-[0.16em]",
  lg: "px-8 py-3 text-[11px] tracking-[0.18em]",
};

function c(v: Variant, s: Size, extra?: string) {
  return [
    "inline-flex items-center justify-center font-sans font-medium uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-1 rounded-[3px]",
    V[v], S[s], extra ?? "",
  ].join(" ").trim();
}

export default function Button({
  variant = "primary", size = "md", className, children, href, onClick, type = "button", disabled,
}: Props) {
  const cls = c(variant, size, className);
  if (href !== undefined) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${cls} disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );
}
