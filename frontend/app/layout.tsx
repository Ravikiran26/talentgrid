import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/_components/AppShell";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "TalentGrid — Executive Recruitment Platform",
    template: "%s | TalentGrid",
  },
  description:
    "TalentGrid connects experienced project management professionals with pre-vetted PM opportunities across India — zero interview time wasted.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
