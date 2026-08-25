"use client";

import React from "react";
import Link from "next/link";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Shared Header */}
      <header className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <ApertureIrisProgress value={50} size={28} />
            <span className="font-display text-[18px] font-semibold">APERTURE</span>
          </Link>
          <div className="flex items-center gap-4 text-[14px]">
            <Link href="/landing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Home</Link>
            <Link href="/pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Pricing</Link>
            <Link href="/dashboard"><Button size="default">App Dashboard</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-16 space-y-10">
        <div className="space-y-4">
          <span className="text-[12px] font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            Brand Philosophy
          </span>
          <h1 className="font-display text-[36px] font-semibold leading-tight">
            Optics Meets Heavy Iron
          </h1>
          <p className="text-[16px] text-[var(--color-text-secondary)] leading-relaxed">
            An aperture is a mechanical iris—a ring of overlapping blades that opens and closes to control how much light passes through a lens. That’s a genuinely fitting metaphor for strength training: controlled, incremental, precise adjustment toward a measurable outcome[cite: 1].
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-[18px]">1. Instrument Readouts</CardTitle></CardHeader>
            <CardContent className="text-[14px] text-[var(--color-text-secondary)]">
              Numbers behave like instrument readouts in tabular monospace, guaranteed never to jitter as values update mid-workout[cite: 1].
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-[18px]">2. Single Accent Rule</CardTitle></CardHeader>
            <CardContent className="text-[14px] text-[var(--color-text-secondary)]">
              Iris green is used only at 3–5% of visible pixels, acting like a light meter needle—rare, precise, and purposeful[cite: 1].
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}