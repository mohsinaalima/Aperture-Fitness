"use client";

import React from "react";
import { X, Flame, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WarmupCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  workingWeight: number;
}

export const WarmupCalculatorModal: React.FC<WarmupCalculatorModalProps> = ({
  isOpen,
  onClose,
  workingWeight,
}) => {
  if (!isOpen) return null;

  const BAR_WEIGHT = 20;
  
  // Standard Strength Warm-up Protocol
  const warmups = [
    { label: "Empty Bar", weight: BAR_WEIGHT, reps: "10 reps", pct: "Bar" },
    { label: "Acclimation", weight: Math.round((workingWeight * 0.5) / 2.5) * 2.5, reps: "5 reps", pct: "50%" },
    { label: "Potentiation", weight: Math.round((workingWeight * 0.7) / 2.5) * 2.5, reps: "3 reps", pct: "70%" },
    { label: "Neural Primer", weight: Math.round((workingWeight * 0.85) / 2.5) * 2.5, reps: "1 rep", pct: "85%" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1113]/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[420px] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] pb-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--color-accent-primary)]" />
            <h3 className="font-display text-[18px] font-semibold text-[var(--color-text-primary)]">
              Warm-up Set Protocol
            </h3>
          </div>
          <button onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="bg-[var(--color-bg-secondary)] p-3 rounded-sm border border-[var(--color-border-default)] text-center">
          <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase">
            TARGET WORKING WEIGHT
          </span>
          <div className="tabular-nums font-mono text-[28px] text-[var(--color-accent-primary)] font-semibold">
            {workingWeight} KG
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
            Progressive Warm-up Sets
          </span>
          <div className="space-y-2">
            {warmups.map((w, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated-2)] text-[var(--color-accent-primary)] font-semibold">
                      {w.pct}
                    </span>
                    <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                      {w.label}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="tabular-nums font-mono text-[15px] font-bold text-[var(--color-text-primary)]">
                    {Math.max(BAR_WEIGHT, w.weight)} kg
                  </div>
                  <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                    {w.reps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onClose} className="w-full text-[13px]">
          Close Protocol
        </Button>
      </div>
    </div>
  );
};