"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAppStore } from "@/store/app-store";
import { fetchApi } from "@/lib/api";
import { mapApiPlans, type ApiPlan } from "@/lib/plans";

export default function PlansPage() {
  const { plans, replacePlans, setActivePlan } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    fetchApi<ApiPlan[]>("/api/v1/plans")
      .then((data) => { if (active) { replacePlans(mapApiPlans(data)); setError(null); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load workout plans."); });
    return () => { active = false; };
  }, [replacePlans]);

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
          {plans.map((plan) => (
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
                    {plan.description || `${plan.days.length} training days`}
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
                      {plan.days.length}
                    </strong>{" "}
                    Days / wk
                  </span>
                  <span className='text-[12px] text-[var(--color-text-muted)]'>
                    Added: {new Date(`${plan.createdAt}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC" })}
                  </span>
                </div>

                <div className='pt-2 border-t border-[var(--color-border-default)] flex items-center justify-between'>
                  <Link href='/plans/builder'>
                    <Button
                      variant='secondary'
                      size='default'
                      className='gap-1.5 text-[13px]'
                    >
                      <span>Edit Plan</span>
                      <ChevronRight className='h-3.5 w-3.5' />
                    </Button>
                  </Link>

                  {plan.isActive ? (
                    <ApertureIrisProgress value={100} size={28} />
                  ) : (
                    <Button variant='ghost' className='h-9 px-3 text-[12px]' onClick={() => { void fetchApi(`/api/v1/plans/${encodeURIComponent(plan.id)}/activate`, { method: "PUT" }).then(() => setActivePlan(plan.id)).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not activate this plan.")); }}>
                      Set active
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {error && <p role="status" className="text-sm text-[var(--color-warning)]">{error}</p>}
        {plans.length === 0 && (
          <Card className='p-8 text-center'>
            <h2 className='font-display text-[20px] font-semibold'>No training plans yet</h2>
            <p className='mt-2 text-[14px] text-[var(--color-text-secondary)]'>Create a plan to organize your next session.</p>
            <Link href='/plans/builder' className='mt-4 inline-block'><Button><Plus className='mr-2 h-4 w-4' />Create your first plan</Button></Link>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
