"use client";

import React from "react";
import Link from "next/link";
import { 
  Play, 
  Trophy, 
  Target, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  Dumbbell 
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

// Mock weekly adherence data (Section 9 & 17 iris dots signature)
const WEEK_ADHERENCE = [
  { day: "M", completed: true },
  { day: "T", completed: true },
  { day: "W", completed: false },
  { day: "T", completed: true },
  { day: "F", completed: false },
  { day: "S", completed: false },
  { day: "S", completed: false },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Phase 1 / Week 3
            </span>
            <h1 className="font-display text-[32px] md:text-[36px] font-semibold leading-tight text-[var(--color-text-primary)]">
              Hypertrophy Block A
            </h1>
          </div>
          <span className="text-[13px] text-[var(--color-text-muted)]">
            Last logged: 2 days ago
          </span>
        </div>

        {/* Hero Card: Today's Workout (Section 9.1) */}
        <Card className="border-[var(--color-accent-primary)]/40 bg-gradient-to-r from-[var(--color-surface-elevated)] to-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <ApertureIrisProgress value={75} size={160} />
          </div>

          <div className="space-y-4 max-w-[560px]">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] text-[12px] font-semibold uppercase tracking-wider">
              Today&apos;s Session
            </div>

            <div>
              <h2 className="font-display text-[24px] md:text-[28px] font-semibold text-[var(--color-text-primary)]">
                Upper Body Power & Hypertrophy
              </h2>
              <div className="flex items-center gap-4 mt-2 text-[13px] text-[var(--color-text-secondary)]">
                <span className="flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <strong className="tabular-nums text-[var(--color-text-primary)]">5</strong> exercises
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
                  <strong className="tabular-nums text-[var(--color-text-primary)]">55</strong> min
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/log">
                <Button size="logger" className="w-full sm:w-auto gap-2 text-[15px]">
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Workout</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Desktop 2-Column Grid (Section 14) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Adherence & Streak Signal (Section 9.2) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[18px]">Weekly Adherence</CardTitle>
                <span className="tabular-nums text-[14px] font-semibold text-[var(--color-accent-primary)]">
                  3 / 4 Sessions
                </span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2 pt-2">
                  {WEEK_ADHERENCE.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-[12px] text-[var(--color-text-muted)] font-mono">
                        {item.day}
                      </span>
                      <ApertureIrisProgress
                        value={item.completed ? 100 : 0}
                        size={32}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Goals (Section 9.4) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[18px]">Active Targets</CardTitle>
                <Link
                  href="/analytics"
                  className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1"
                >
                  View analytics <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {/* Goal Item 1 */}
                <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]">
                  <div className="flex items-center gap-3">
                    <ApertureIrisProgress value={80} size={28} />
                    <div>
                      <h4 className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        Bench Press 1RM Target
                      </h4>
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        Target: <span className="tabular-nums">120 kg</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="tabular-nums text-[16px] font-medium text-[var(--color-accent-primary)]">
                      -2.5 kg
                    </span>
                    <p className="text-[11px] text-[var(--color-text-muted)]">remaining</p>
                  </div>
                </div>

                {/* Goal Item 2 */}
                <div className="flex items-center justify-between p-3 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]">
                  <div className="flex items-center gap-3">
                    <ApertureIrisProgress value={60} size={28} />
                    <div>
                      <h4 className="text-[14px] font-medium text-[var(--color-text-primary)]">
                        Weekly Volume Target
                      </h4>
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        Target: <span className="tabular-nums">35,000 kg</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="tabular-nums text-[16px] font-medium text-[var(--color-text-primary)]">
                      24,200 kg
                    </span>
                    <p className="text-[11px] text-[var(--color-text-muted)] font-mono">logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Column (1/3 width on desktop) (Section 9.3 & 9.5) */}
          <div className="space-y-6">
            {/* Recent PR Banner */}
            <Card className="border-[var(--color-accent-primary)]/30">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Trophy className="h-4 w-4 text-[var(--color-accent-primary)]" />
                <CardTitle className="text-[16px]">Latest Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <span className="text-[12px] text-[var(--color-text-muted)] uppercase tracking-wider">
                  Barbell Back Squat
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="tabular-nums text-[32px] font-medium text-[var(--color-text-primary)] leading-none">
                    142.5
                  </span>
                  <span className="text-[14px] font-semibold text-[var(--color-text-secondary)]">
                    KG x 5
                  </span>
                </div>
                <p className="text-[12px] text-[var(--color-accent-primary)] font-medium">
                  +5 kg PR set on Aug 22
                </p>
              </CardContent>
            </Card>

            {/* Supporting Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-[16px]">Training Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-default)]">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    Monthly Volume
                  </span>
                  <span className="tabular-nums text-[16px] font-medium text-[var(--color-text-primary)]">
                    98,450 kg
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[var(--color-border-default)]">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    Avg Rest Duration
                  </span>
                  <span className="tabular-nums text-[16px] font-medium text-[var(--color-text-primary)]">
                    02:15 min
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-[var(--color-text-secondary)]">
                    Consistency Score
                  </span>
                  <span className="tabular-nums text-[16px] font-medium text-[var(--color-accent-primary)]">
                    92%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}