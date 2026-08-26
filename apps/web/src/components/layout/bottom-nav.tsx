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
    if (user?.role === "owner") {
      return [
        { label: "Portal", href: "/owner", icon: Building2 },
        { label: "Trainers", href: "/owner", icon: Users },
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
        { label: "Profile", href: "/profile", icon: User },
      ];
    }

    if (user?.role === "trainer") {
      return [
        { label: "Clients", href: "/trainer", icon: Users },
        { label: "Builder", href: "/plans/builder", icon: Calendar },
        { label: "Exercises", href: "/exercises", icon: Dumbbell },
        { label: "Profile", href: "/profile", icon: User },
      ];
    }

    return [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Plans", href: "/plans", icon: Calendar },
      { label: "Log", href: "/log", icon: Plus, isElevated: true },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Profile", href: "/profile", icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)] flex items-center justify-around px-2 z-40 pb-[env(safe-area-inset-bottom)]'>
      {navItems.map((item, i) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.isElevated) {
          return (
            <Link
              key={i}
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
            key={i}
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
