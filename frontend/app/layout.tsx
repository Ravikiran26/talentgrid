import type { Metadata } from "next";
import { Libre_Baskerville, Work_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/app/_components/AppShell";

const serif = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif-face",
  display: "swap",
  weight: ["400", "700"],
});

const sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans-face",
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
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ivory text-charcoal antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
