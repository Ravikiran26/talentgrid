"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AUTH_ROUTES = ["/register", "/login", "/forgot-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.includes(pathname);

  return (
    <>
      {!isAuth && <Header />}
      <main className={isAuth ? "" : "flex-1"}>{children}</main>
      {!isAuth && <Footer />}
    </>
  );
}
