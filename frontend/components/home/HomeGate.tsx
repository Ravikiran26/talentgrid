"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, syncRoleCookie, type AuthUser } from "@/lib/auth";
import CandidateDashboard from "@/components/candidate/CandidateDashboard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Props {
  serverRole: string | null;
  children: React.ReactNode;
}

/** `/` renders the public landing for visitors and the candidate workspace for signed-in candidates. */
export default function HomeGate({ serverRole, children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    const u = getUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u);
    const clientRole = u?.role ?? null;
    if (clientRole !== serverRole) {
      syncRoleCookie(u);
      router.refresh();
    }
  }, [serverRole, router]);

  // Signed-in candidate: the existing workspace with the existing shared chrome.
  if (user?.role === "CANDIDATE") {
    return (
      <>
        <Header />
        <CandidateDashboard user={user} />
        <Footer />
      </>
    );
  }
  if (user === undefined && serverRole === "CANDIDATE") {
    return <div className="min-h-screen bg-ivory" aria-busy="true" />;
  }
  // Everyone else: the public landing, which brings its own header and footer.
  return <>{children}</>;
}
