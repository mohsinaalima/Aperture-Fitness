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
  Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: Calendar },
  { label: "Log Workout", href: "/log", icon: PlusCircle },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[240px] h-screen flex-col fixed left-0 top-0 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] p-4 z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-3 py-4 mb-2">
        <div className="h-6 w-6 rounded-full border-2 border-[var(--color-accent-primary)] flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />
        </div>
        <span className="font-display text-[18px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          APERTURE
        </span>
      </div>

      {/* Quick Launch Action (Section 14) */}
      <div className="mb-6 px-1">
        <Button className="w-full justify-start gap-2 text-[13px]" size="default">
          <Play className="h-4 w-4 fill-current" />
          <span>Today&apos;s Workout</span>
        </Button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 text-[14px] font-medium transition-colors duration-100",
                isActive
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] rounded-full font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Icon className={cn("h-5 w-5 stroke-[1.5]", isActive && "stroke-[2]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};