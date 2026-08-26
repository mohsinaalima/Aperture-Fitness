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
  Dumbbell,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAppStore } from "@/store/app-store";

export default function DashboardPage() {
  const { plans, completedSessions } = useAppStore();

  const activePlan = plans.find((p) => p.isActive) || plans[0];
  const todayDaySpec = activePlan?.days[0];

  const totalMonthlyVolume = completedSessions.reduce(
    (sum, sess) => sum + sess.totalVolumeKg,
    0,
  );

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-2'>
          <div>
            <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
              Active Program
            </span>
            <h1 className='font-display text-[32px] md:text-[36px] font-semibold leading-tight text-[var(--color-text-primary)]'>
              {activePlan?.name || "Custom Training Spec"}
            </h1>
          </div>
          <span className='text-[13px] text-[var(--color-text-muted)] font-mono'>
            {completedSessions.length > 0
              ? `Last logged: ${new Date(
                  completedSessions[0].completedAt,
                ).toLocaleDateString()}`
              : "No logged workouts yet"}
          </span>
        </div>

        {/* Hero Card: Today's Session (Dynamic) */}
        <Card className='border-[var(--color-accent-primary)]/40 bg-gradient-to-r from-[var(--color-surface-elevated)] to-[var(--color-bg-secondary)] relative overflow-hidden'>
          <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block'>
            <ApertureIrisProgress value={75} size={160} />
          </div>

          <div className='space-y-4 max-w-[560px]'>
            <div className='inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] text-[12px] font-semibold uppercase tracking-wider'>
              Today&apos;s Workout
            </div>

            <div>
              <h2 className='font-display text-[24px] md:text-[28px] font-semibold text-[var(--color-text-primary)]'>
                {todayDaySpec?.name || "Full Body Power & Hypertrophy"}
              </h2>
              <div className='flex items-center gap-4 mt-2 text-[13px] text-[var(--color-text-secondary)]'>
                <span className='flex items-center gap-1.5'>
                  <Dumbbell className='h-4 w-4 text-[var(--color-text-muted)]' />
                  <strong className='tabular-nums text-[var(--color-text-primary)]'>
                    {todayDaySpec?.exercises.length || 0}
                  </strong>{" "}
                  exercises
                </span>
                <span className='flex items-center gap-1.5'>
                  <Clock className='h-4 w-4 text-[var(--color-text-muted)]' />
                  <strong className='tabular-nums text-[var(--color-text-primary)]'>
                    45–60
                  </strong>{" "}
                  min
                </span>
              </div>
            </div>

            <div className='pt-2'>
              <Link href='/log'>
                <Button
                  size='logger'
                  className='w-full sm:w-auto gap-2 text-[15px]'
                >
                  <Play className='h-5 w-5 fill-current' />
                  <span>Start Workout Session</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Dynamic Metric Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Active Targets */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-[18px]'>Program Targets</CardTitle>
                <Link
                  href='/analytics'
                  className='text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center gap-1'
                >
                  View analytics <ChevronRight className='h-3.5 w-3.5' />
                </Link>
              </CardHeader>
              <CardContent className='space-y-3 pt-2'>
                <div className='flex items-center justify-between p-3 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]'>
                  <div className='flex items-center gap-3'>
                    <ApertureIrisProgress value={85} size={28} />
                    <div>
                      <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                        Monthly Volume Goal
                      </h4>
                      <p className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                        Target: 50,000 kg
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <span className='tabular-nums text-[16px] font-mono font-medium text-[var(--color-accent-primary)]'>
                      {totalMonthlyVolume.toLocaleString()} kg
                    </span>
                    <p className='text-[11px] text-[var(--color-text-muted)] font-mono'>
                      logged
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-6'>
            {/* Summary Stats */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-[16px]'>Training Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 pt-1'>
                <div className='flex items-center justify-between py-2 border-b border-[var(--color-border-default)]'>
                  <span className='text-[13px] text-[var(--color-text-secondary)]'>
                    Total Volume Logged
                  </span>
                  <span className='tabular-nums text-[15px] font-mono font-medium text-[var(--color-text-primary)]'>
                    {totalMonthlyVolume.toLocaleString()} kg
                  </span>
                </div>
                <div className='flex items-center justify-between py-2 border-b border-[var(--color-border-default)]'>
                  <span className='text-[13px] text-[var(--color-text-secondary)]'>
                    Sessions Completed
                  </span>
                  <span className='tabular-nums text-[15px] font-mono font-medium text-[var(--color-text-primary)]'>
                    {completedSessions.length}
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
