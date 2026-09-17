"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const AUTH_ROUTES = ["/register", "/login", "/forgot-password"];

/** Routes that render their own header and footer. `/` serves two different
 *  experiences (public landing vs. candidate workspace) and picks its own chrome. */
const SELF_CHROME_ROUTES = ["/"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.includes(pathname);
  const selfChrome = SELF_CHROME_ROUTES.includes(pathname);
  const showChrome = !isAuth && !selfChrome;

  return (
    <>
      {showChrome && <Header />}
      <main className={isAuth ? "" : "flex-1 flex flex-col"}>{children}</main>
      {showChrome && <Footer />}
    </>
  );
}
