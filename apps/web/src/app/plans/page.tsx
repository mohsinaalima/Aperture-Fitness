"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

const PLANS = [
  {
    id: "plan-1",
    name: "Hypertrophy Block A",
    daysCount: 4,
    isActive: true,
    lastEdited: "Aug 24, 2026",
    focus: "Upper / Lower Split",
  },
  {
    id: "plan-2",
    name: "Strength Peaking Phase 1",
    daysCount: 3,
    isActive: false,
    lastEdited: "Jul 12, 2026",
    focus: "SBD Heavy Triples",
  },
  {
    id: "plan-3",
    name: "Engine & Capacity Deload",
    daysCount: 3,
    isActive: false,
    lastEdited: "Jun 02, 2026",
    focus: "GPP & Mobility",
  },
];

export default function PlansPage() {
  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-default)] pb-4'>
          <div>
            <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
              Program Architecture
            </span>
            <h1 className='font-display text-[32px] font-semibold text-[var(--color-text-primary)]'>
              Workout Plans
            </h1>
          </div>

          <Link href='/plans/builder'>
            <Button className='gap-2 text-[13px]'>
              <Plus className='h-4 w-4' />
              <span>New Plan</span>
            </Button>
          </Link>
        </div>

        {/* Plan Grid (Section 18.5) */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between transition-colors ${
                plan.isActive
                  ? "border-[var(--color-accent-primary)]/50 bg-[var(--color-surface-elevated)]"
                  : "border-[var(--color-border-default)]"
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between mb-1.5'>
                  <span className='text-[12px] font-mono text-[var(--color-text-muted)]'>
                    {plan.focus}
                  </span>
                  {plan.isActive && (
                    <span className='px-2 py-0.5 rounded-sm bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] text-[11px] font-mono font-semibold text-[var(--color-accent-primary)]'>
                      ACTIVE PLAN
                    </span>
                  )}
                </div>
                <CardTitle className='text-[20px]'>{plan.name}</CardTitle>
              </CardHeader>

              <CardContent className='space-y-4 pt-0'>
                <div className='flex items-center gap-4 text-[13px] text-[var(--color-text-secondary)] pt-1'>
                  <span className='flex items-center gap-1.5'>
                    <Calendar className='h-4 w-4 text-[var(--color-text-muted)]' />
                    <strong className='tabular-nums text-[var(--color-text-primary)]'>
                      {plan.daysCount}
                    </strong>{" "}
                    Days / wk
                  </span>
                  <span className='text-[12px] text-[var(--color-text-muted)]'>
                    Edited: {plan.lastEdited}
                  </span>
                </div>

                <div className='pt-2 border-t border-[var(--color-border-default)] flex items-center justify-between'>
                  <Link href='/plans/builder'>
                    <Button
                      variant='secondary'
                      size='default'
                      className='gap-1.5 text-[13px]'
                    >
                      <span>View Plan Spec</span>
                      <ChevronRight className='h-3.5 w-3.5' />
                    </Button>
                  </Link>

                  <ApertureIrisProgress
                    value={plan.isActive ? 100 : 35}
                    size={28}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
