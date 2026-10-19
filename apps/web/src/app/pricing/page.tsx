"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

type PricingData = { tiers: Array<{ id: string; slug: string; name: string; priceFormatted: string; isRecommended: boolean; ctaLabel: string; ctaLink: string }>; features: Array<{ featureName: string; values: Record<string, string> }> };

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  useEffect(() => {
    let active = true;
    fetchApi<PricingData>("/api/pricing")
      .then((data) => { if (active) setPricing(data); })
      .catch((error: unknown) => console.error("Could not load pricing table:", error));
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
            <Link href="/login"><Button size="default">Sign in</Button></Link>
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
            Choose the setup that matches the way you train.
          </p>
        </div>

        {/* Restrained Pricing Table (Section 18.13) */}
        <div className="overflow-x-auto border border-[var(--color-border-default)] rounded-md bg-[var(--color-surface-elevated)]">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
                <th className="p-4 text-[var(--color-text-muted)] font-mono text-[12px] uppercase">Plan Features</th>
                {(pricing?.tiers ?? []).map((tier) => <th key={tier.id} className={`p-4 font-display text-[16px] ${tier.isRecommended ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30" : ""}`}>{tier.name}{tier.isRecommended ? " (Recommended)" : ""}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-default)]">
              <tr><td className="p-4 text-[var(--color-text-secondary)]">Monthly Price</td>{(pricing?.tiers ?? []).map((tier) => <td key={tier.id} className={`p-4 font-mono font-medium ${tier.isRecommended ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30" : ""}`}>{tier.priceFormatted}</td>)}</tr>
              {(pricing?.features ?? []).map((feature) => <tr key={feature.featureName}><td className="p-4 text-[var(--color-text-secondary)]">{feature.featureName}</td>{(pricing?.tiers ?? []).map((tier) => { const value = feature.values[tier.slug] ?? "—"; return <td key={tier.id} className={`p-4 ${tier.isRecommended ? "bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30" : ""}`}>{value.toLowerCase() === "yes" ? <Check className="h-4 w-4 text-[var(--color-accent-primary)]" /> : value}</td>; })}</tr>)}
              <tr>
                <td className="p-4">Action</td>
                {(pricing?.tiers ?? []).map((tier) => <td key={tier.id} className={`p-4 ${tier.isRecommended ? "bg-[var(--color-accent-subtle)] border-x border-[var(--color-accent-primary)]/30" : ""}`}><Link href={tier.ctaLink}><Button variant={tier.isRecommended ? "primary" : "secondary"} className="w-full text-[13px]">{tier.ctaLabel}</Button></Link></td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
