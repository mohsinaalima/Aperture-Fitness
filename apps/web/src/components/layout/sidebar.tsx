"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  User,
  Play,
  Building2,
  Users,
  Dumbbell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Role-based Navigation Configuration
  const getNavItems = () => {
    if (user?.role === "owner") {
      return [
        { label: "Owner Portal", href: "/owner", icon: Building2 },
        { label: "Trainer Roster", href: "/owner", icon: Users },
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
        { label: "Profile", href: "/profile", icon: User },
      ];
    }

    if (user?.role === "trainer") {
      return [
        { label: "Trainer Workspace", href: "/trainer", icon: Users },
        { label: "Plan Builder", href: "/plans/builder", icon: Calendar },
        { label: "Exercise Library", href: "/exercises", icon: Dumbbell },
        { label: "Analytics", href: "/analytics", icon: BarChart3 },
        { label: "Profile", href: "/profile", icon: User },
      ];
    }

    // Default Member Navigation
    return [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Plans", href: "/plans", icon: Calendar },
      { label: "Log Workout", href: "/log", icon: PlusCircle },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Profile", href: "/profile", icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className='hidden md:flex w-[240px] h-screen flex-col fixed left-0 top-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] p-4 z-30 justify-between'>
      <div className='space-y-4'>
        {/* Brand Header */}
        <div className='flex items-center gap-2.5 px-3 py-2'>
          <div className='h-6 w-6 rounded-full border-2 border-[var(--color-accent-primary)] flex items-center justify-center'>
            <div className='h-2 w-2 rounded-full bg-[var(--color-accent-primary)]' />
          </div>
          <div>
            <span className='font-display text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)] block'>
              APERTURE
            </span>
            <span className='text-[10px] font-mono text-[var(--color-accent-primary)] uppercase tracking-wider block'>
              {user?.role || "MEMBER"} ACCESS
            </span>
          </div>
        </div>

        {/* Quick Action Button for Members */}
        {user?.role === "member" && (
          <div className='px-1 pt-1'>
            <Link href='/log'>
              <Button
                className='w-full justify-start gap-2 text-[13px]'
                size='default'
              >
                <Play className='h-4 w-4 fill-current' />
                <span>Today&apos;s Workout</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Dynamic Navigation Links */}
        <nav className='space-y-1'>
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium transition-colors duration-100",
                  isActive
                    ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] rounded-full font-semibold"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 stroke-[1.5]",
                    isActive && "stroke-[2]",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className='border-t border-[var(--color-border-default)] pt-3 px-2 flex items-center justify-between'>
        <div className='truncate'>
          <p className='text-[13px] font-semibold text-[var(--color-text-primary)] truncate'>
            {user?.name || "Alex Foster"}
          </p>
          <p className='text-[11px] font-mono text-[var(--color-text-muted)] truncate'>
            {user?.gymName || "Aperture Hub"}
          </p>
        </div>
        <button
          onClick={logout}
          aria-label='Log out'
          className='p-1.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors cursor-pointer'
        >
          <LogOut className='h-4 w-4' />
        </button>
      </div>
    </aside>
  );
};
