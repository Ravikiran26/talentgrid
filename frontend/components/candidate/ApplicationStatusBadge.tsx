export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "REJECTED"
  | "SELECTED";

const CONFIG: Record<ApplicationStatus, { label: string; cls: string; dot: string }> = {
  APPLIED:      { label: "Applied",      cls: "text-navy-light bg-[#EEF2F6] border-[#D5DEE8]",  dot: "bg-navy-light" },
  UNDER_REVIEW: { label: "Under Review", cls: "text-[#7A5A1E] bg-highlight border-highlight-border",  dot: "bg-brass" },
  SHORTLISTED:  { label: "Shortlisted",  cls: "text-[#1F5E3F] bg-[#EAF4EE] border-[#CDE3D6]",  dot: "bg-[#2F7D55]" },
  INTERVIEW:    { label: "Interview",    cls: "text-[#3D3A6E] bg-[#EFEEF8] border-[#D9D6EC]",  dot: "bg-[#5B559B]" },
  REJECTED:     { label: "Not Selected", cls: "text-[#7A2E2E] bg-[#F8ECEC] border-[#E9D0D0]",  dot: "bg-[#B04A4A]" },
  SELECTED:     { label: "Selected",     cls: "text-[#1F5E3F] bg-[#E3F1E9] border-[#BFDCCB]",  dot: "bg-[#1F7A4B]" },
};

export default function ApplicationStatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as ApplicationStatus] ?? CONFIG.APPLIED;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-sans font-semibold tracking-[0.04em] px-2.5 py-1 border rounded-[4px] ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
