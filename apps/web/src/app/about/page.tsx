"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

type AboutData = { brand_name: string; tagline: string; philosophy: string; pillars: Array<{ id: number; title: string; description: string }> };

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);
  useEffect(() => {
    let active = true;
    fetchApi<AboutData>("/about")
      .then((data) => { if (active) setAbout(data); })
      .catch((error: unknown) => console.error("Could not load about page content:", error));
    return () => { active = false; };
  }, []);
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Shared Header */}
      <header className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
        <div className="max-w-[1120px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <ApertureIrisProgress value={50} size={28} />
            <span className="font-display text-[18px] font-semibold">APERTURE</span>
          </Link>
          <div className="flex items-center gap-4 text-[14px]">
            <Link href="/" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Home</Link>
            <Link href="/pricing" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">Pricing</Link>
            <Link href="/login"><Button size="default">Sign in</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 py-16 space-y-10">
        <div className="space-y-4">
          <span className="text-[12px] font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            Brand Philosophy
          </span>
            <h1 className="font-display text-[36px] font-semibold leading-tight">
            {about?.tagline || "Optics Meets Heavy Iron"}
          </h1>
          <p className="text-[16px] text-[var(--color-text-secondary)] leading-relaxed">
            {about?.philosophy || "An aperture is a mechanical iris: overlapping blades that adjust with precision. We bring that same measured approach to strength training, helping you focus on each session and build toward meaningful progress."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(about?.pillars ?? [
            { id: 1, title: "1. Instrument Readouts", description: "Stable, easy-to-scan numbers help you track each set while you train." },
            { id: 2, title: "2. Single Accent Rule", description: "A restrained iris green accent marks actions and progress without distracting from your workout." },
          ]).map((pillar) => <Card key={pillar.id}><CardHeader><CardTitle className="text-[18px]">{pillar.title}</CardTitle></CardHeader><CardContent className="text-[14px] text-[var(--color-text-secondary)]">{pillar.description}</CardContent></Card>)}
        </div>
      </main>
    </div>
  );
}
