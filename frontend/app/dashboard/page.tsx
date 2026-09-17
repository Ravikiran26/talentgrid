"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, type AuthUser } from "@/lib/auth";
import CandidateDashboard from "@/components/candidate/CandidateDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "CANDIDATE") { router.push("/"); return; }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(u);
  }, [router]);

  if (!user) return <div className="min-h-screen bg-ivory" aria-busy="true" />;
  return <CandidateDashboard user={user} />;
}
