import * as React from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { OfflineBanner } from "./offline-banner";
import { FloatingRestTimer } from "./floating-rest-timer";
import { useAuth } from "@/context/auth-context";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const roleMismatch = Boolean(
    user &&
      ((pathname.startsWith("/owner") && !user.roles.includes("owner")) ||
        (pathname.startsWith("/trainer") && !user.roles.includes("trainer"))),
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    } else if (user && roleMismatch) {
      router.replace(user.roles.includes(user.role) ? routeForRole(user.role) : "/dashboard");
    }
  }, [isLoading, roleMismatch, router, user]);

  if (isLoading || !user || roleMismatch) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4 text-center font-mono text-sm text-[var(--color-text-secondary)]' role='status'>
        {isLoading ? "Checking your session…" : roleMismatch ? "Opening your workspace…" : "Taking you to sign in…"}
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]'>
      <OfflineBanner />
      <Sidebar />
      <main className='md:pl-[240px] pb-[80px] md:pb-8 transition-all pt-2'>
        <div className='max-w-[1120px] mx-auto px-4 md:px-8 py-6'>
          {children}
        </div>
      </main>
      <FloatingRestTimer />
      <BottomNav />
    </div>
  );
};

function routeForRole(role: string): string {
  if (role === "owner") return "/owner";
  if (role === "trainer") return "/trainer";
  return "/dashboard";
}
