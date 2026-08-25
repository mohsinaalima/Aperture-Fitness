"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
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
            <Link href="/dashboard"><Button size="default">App Dashboard</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[12px] font-mono text-[var(--color-accent-primary)] uppercase tracking-wider">
            Transparent Pricing Table
          </span>
          <h1 className="font-display text-[36px] font-semibold">Choose Your Training Level</h1>
          <p className="text-[15px] text-[var(--color-text-secondary)]">
            Restrained pricing plans with no hidden fees or gimmicks[cite: 1].
          </p>
        </div>

        {/* Restrained Pricing Table (Section 18.13) */}
        <div className="overflow-x-auto border border-[var(--color-border-default)] rounded-md bg-[var(--color-surface-elevated)]">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
                <th className="p-4 text-[var(--color-text-muted)] font-mono text-[12px] uppercase">Plan Features</th>
                <th className="p-4 font-display text-[16px]">Athlete Tier</th>
                <th className="p-4 font-display text-[16px] text-[var(--color-accent-primary)] bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30">
                  Pro Athlete (Recommended)
                </th>
                <th className="p-4 font-display text-[16px]">Gym / Trainer Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              <tr>
                <td className="p-4 text-[var(--color-text-secondary)]">Monthly Price</td>
                <td className="p-4 font-mono font-medium">$0 / Free</td>
                <td className="p-4 font-mono font-medium text-[var(--color-accent-primary)] bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30">
                  $12 / mo
                </td>
                <td className="p-4 font-mono font-medium">$49 / mo</td>
              </tr>
              <tr>
                <td className="p-4 text-[var(--color-text-secondary)]">Workout Logger & Steppers</td>
                <td className="p-4"><Check className="h-4 w-4 text-[var(--color-accent-primary)]" /></td>
                <td className="p-4 bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30"><Check className="h-4 w-4 text-[var(--color-accent-primary)]" /></td>
                <td className="p-4"><Check className="h-4 w-4 text-[var(--color-accent-primary)]" /></td>
              </tr>
              <tr>
                <td className="p-4 text-[var(--color-text-secondary)]">Spec Plan Builder & Versioning</td>
                <td className="p-4 text-[var(--color-text-muted)]">1 Active Plan</td>
                <td className="p-4 bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30 font-medium">Unlimited Snapshots</td>
                <td className="p-4 font-medium">Trainer Spec Builder</td>
              </tr>
              <tr>
                <td className="p-4 text-[var(--color-text-secondary)]">Trainer Roster & Attendance</td>
                <td className="p-4 text-[var(--color-text-muted)]">—</td>
                <td className="p-4 bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30 text-[var(--color-text-muted)]">—</td>
                <td className="p-4"><Check className="h-4 w-4 text-[var(--color-accent-primary)]" /></td>
              </tr>
              <tr>
                <td className="p-4">Action</td>
                <td className="p-4">
                  <Link href="/dashboard"><Button variant="secondary" className="w-full text-[13px]">Get Started</Button></Link>
                </td>
                <td className="p-4 bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30">
                  <Link href="/dashboard"><Button className="w-full text-[13px]">Start Pro Trial</Button></Link>
                </td>
                <td className="p-4">
                  <Link href="/owner"><Button variant="secondary" className="w-full text-[13px]">Owner Dashboard</Button></Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}