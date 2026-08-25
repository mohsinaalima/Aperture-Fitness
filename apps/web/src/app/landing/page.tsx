"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2, Shield, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Marketing Header */}
      <header className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] sticky top-0 z-50">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ApertureIrisProgress value={50} size={28} />
            <span className="font-display text-[18px] font-semibold tracking-tight">
              APERTURE
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[14px] text-[var(--color-text-secondary)]">
            <Link href="/landing" className="text-[var(--color-text-primary)] font-medium">
              Home
            </Link>
            <Link href="/about" className="hover:text-[var(--color-text-primary)] transition-colors">
              About
            </Link>
            <Link href="/pricing" className="hover:text-[var(--color-text-primary)] transition-colors">
              Pricing
            </Link>
            <Link href="/owner" className="hover:text-[var(--color-text-primary)] transition-colors">
              Owner Portal
            </Link>
            <Link href="/trainer" className="hover:text-[var(--color-text-primary)] transition-colors">
              Trainer Portal
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="default" className="text-[13px]">
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="default" className="text-[13px] gap-1.5">
                <span>Start Training</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Section 18.1) */}
      <section className="max-w-[1120px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="inline-block px-3 py-1 rounded-sm bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] text-[12px] font-mono text-[var(--color-accent-primary)] font-semibold uppercase tracking-wider">
            Precision Strength Instrument
          </span>

          <h1 className="font-display text-[40px] md:text-[52px] font-semibold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
            Strength Training Built Like an Instrument.
          </h1>

          <p className="text-[16px] md:text-[18px] text-[var(--color-text-secondary)] leading-relaxed max-w-[480px]">
            Monospace readouts, 1px hairline interfaces, and mechanical iris progress metrics. Engineered for serious athletes, trainers, and gym owners.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="logger" className="w-full sm:w-auto text-[15px] gap-2">
                <span>Start Training</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="logger" className="w-full sm:w-auto text-[15px]">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Mid-Transition Signature Iris Graphic (Section 18.1) */}
        <div className="flex flex-col items-center justify-center p-8 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-[var(--color-accent-primary)]/5 to-transparent pointer-events-none" />
          <ApertureIrisProgress value={50} size={220} className="my-4" />
          <span className="font-mono text-[13px] text-[var(--color-text-secondary)] tracking-widest uppercase mt-4">
            Aperture Iris Engine • 50% Calibrated
          </span>
        </div>
      </section>

      {/* Interface Showcase Mock */}
      <section className="border-t border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] py-16">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center max-w-[600px] mx-auto space-y-2">
            <h2 className="font-display text-[28px] font-semibold">Zero Distraction Logging</h2>
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              Built for sweating, distracted users standing in the gym with 56px touch steppers and clear tabular mono readouts[cite: 1].
            </p>
          </div>

          <Card className="max-w-[680px] mx-auto p-6 space-y-4 border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-3">
              <span className="font-display text-[18px] font-semibold">Barbell Bench Press</span>
              <span className="font-mono text-[12px] text-[var(--color-accent-primary)]">SET 3 OF 4</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-sm border border-[var(--color-border-default)] text-center">
                <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase">LOAD WEIGHT</span>
                <div className="tabular-nums font-mono text-[32px] text-[var(--color-text-primary)]">85.0 KG</div>
              </div>
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-sm border border-[var(--color-border-default)] text-center">
                <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase">REPETITIONS</span>
                <div className="tabular-nums font-mono text-[32px] text-[var(--color-text-primary)]">6 REPS</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}