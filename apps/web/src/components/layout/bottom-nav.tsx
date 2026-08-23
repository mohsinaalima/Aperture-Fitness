"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  BarChart3, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Plans", href: "/plans", icon: Calendar },
  { label: "Log", href: "/log", icon: Plus, isElevated: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)] flex items-center justify-around px-2 z-40 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        // Elevated Center Action (Log Workout)
        if (item.isElevated) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex items-center justify-center -translate-y-2"
            >
              <div className="h-12 w-12 rounded-full bg-[var(--color-accent-primary)] text-[#0E1113] flex items-center justify-center shadow-md active:scale-95 transition-transform">
                <Icon className="h-6 w-6 stroke-[2.5]" />
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
              isActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]"
            )}
          >
            <Icon 
              className={cn(
                "h-5 w-5 stroke-[1.5]", 
                isActive && "fill-[var(--color-accent-primary)] stroke-[1.5]"
              )} 
            />
            {/* Label appears only on active item to reduce clutter (Section 8) */}
            {isActive && (
              <span className="text-[10px] font-semibold tracking-tight mt-1">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};