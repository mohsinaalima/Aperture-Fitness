"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  BarChart3,
  User,
  Building2,
  Users,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const getNavItems = () => {
    const roles = user?.roles ?? [];
    const items = [];
    if (roles.includes("member")) {
      items.push(
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Plans", href: "/plans", icon: Calendar },
        { label: "Log", href: "/log", icon: Plus, isElevated: true },
      );
    }
    if (roles.includes("trainer")) items.push({ label: "Clients", href: "/trainer", icon: Users });
    if (roles.includes("owner")) items.push({ label: "Portal", href: "/owner", icon: Building2 });
    items.push({ label: "Profile", href: "/profile", icon: User });
    return items.slice(0, 5);
  };

  const navItems = getNavItems();

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)] flex items-center justify-around px-2 z-40 pb-[env(safe-area-inset-bottom)]'>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.isElevated) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className='flex items-center justify-center -translate-y-2'
            >
              <div className='h-12 w-12 rounded-full bg-[var(--color-accent-primary)] text-[#0E1113] flex items-center justify-center shadow-md active:scale-95 transition-transform'>
                <Icon className='h-6 w-6 stroke-[2.5]' />
              </div>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center h-full min-w-[56px] px-2 transition-colors",
              isActive
                ? "text-[var(--color-accent-primary)]"
                : "text-[var(--color-text-muted)]",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 stroke-[1.5]",
                isActive && "fill-[var(--color-accent-primary)] stroke-[1.5]",
              )}
            />
            {isActive && (
              <span className='text-[10px] font-semibold tracking-tight mt-1'>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};
