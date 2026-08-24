"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function NumericStepper({
  value,
  onChange,
  step = 2.5,
  unit = "kg",
  min = 0,
  max = 999,
  label,
  className,
}: NumericStepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) onChange(Number((value - step).toFixed(2)));
  };

  const handleIncrement = () => {
    if (value + step <= max) onChange(Number((value + step).toFixed(2)));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
          {label}
        </span>
      )}
      <div className='flex items-center gap-2 bg-[var(--color-bg-secondary)] p-1.5 rounded-sm border border-[var(--color-border-default)]'>
        {/* Decrement Target - 56x56px touch compliance */}
        <button
          type='button'
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label || unit}`}
          className='flex h-[56px] w-[56px] items-center justify-center rounded-sm bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] active:bg-[var(--color-surface-elevated-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
        >
          <Minus className='h-5 w-5 stroke-[1.5]' />
        </button>

        {/* Readout with JetBrains Mono tabular numerals */}
        <div className='flex flex-1 items-baseline justify-center gap-1.5 py-1'>
          <span className='tabular-nums text-[28px] font-medium leading-none text-[var(--color-text-primary)]'>
            {value}
          </span>
          <span className='text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]'>
            {unit}
          </span>
        </div>

        {/* Increment Target - 56x56px touch compliance */}
        <button
          type='button'
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label || unit}`}
          className='flex h-[56px] w-[56px] items-center justify-center rounded-sm bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] active:bg-[var(--color-surface-elevated-2)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer'
        >
          <Plus className='h-5 w-5 stroke-[1.5]' />
        </button>
      </div>
    </div>
  );
}
