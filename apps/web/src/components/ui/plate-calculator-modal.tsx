"use client";

import React from "react";
import { X, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeight: number;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose,
  targetWeight,
}) => {
  if (!isOpen) return null;

  const BAR_WEIGHT = 20; // Standard Olympic Barbell (kg)
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];

  const weightPerSide = Math.max(0, (targetWeight - BAR_WEIGHT) / 2);

  const calculatePlates = (weightNeeded: number) => {
    let current = weightNeeded;
    const result: { plate: number; count: number }[] = [];

    availablePlates.forEach((plate) => {
      const count = Math.floor(current / plate);
      if (count > 0) {
        result.push({ plate, count });
        current -= count * plate;
      }
    });

    return result;
  };

  const plateBreakdown = calculatePlates(weightPerSide);

  return (
    <div className='fixed inset-0 z-50 bg-[#0E1113]/80 backdrop-blur-xs flex items-center justify-center p-4'>
      <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[420px] p-5 space-y-4'>
        <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
          <div className='flex items-center gap-2'>
            <Calculator className='h-4 w-4 text-[var(--color-accent-primary)]' />
            <h3 className='font-display text-[18px] font-semibold text-[var(--color-text-primary)]'>
              Plate Calculator
            </h3>
          </div>
          <button onClick={onClose} className='cursor-pointer'>
            <X className='h-5 w-5 text-[var(--color-text-muted)]' />
          </button>
        </div>

        <div className='bg-[var(--color-bg-secondary)] p-3 rounded-sm border border-[var(--color-border-default)] text-center'>
          <span className='text-[11px] font-mono text-[var(--color-text-muted)] uppercase'>
            TARGET LOAD (20kg Olympic Bar)
          </span>
          <div className='tabular-nums font-mono text-[32px] text-[var(--color-accent-primary)] font-semibold'>
            {targetWeight} KG
          </div>
          <span className='text-[12px] text-[var(--color-text-secondary)] font-mono'>
            Load{" "}
            <strong className='text-[var(--color-text-primary)]'>
              {weightPerSide} kg
            </strong>{" "}
            per side
          </span>
        </div>

        <div className='space-y-2'>
          <span className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
            Plates Required Per Side
          </span>
          {plateBreakdown.length === 0 ? (
            <p className='text-[13px] text-[var(--color-text-muted)] italic'>
              Empty bar (20kg) — No extra plates required.
            </p>
          ) : (
            <div className='space-y-1.5'>
              {plateBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between p-2.5 rounded-sm bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]'
                >
                  <span className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                    {item.plate} kg Plate
                  </span>
                  <span className='tabular-nums font-mono text-[14px] font-bold text-[var(--color-accent-primary)] px-2 py-0.5 rounded bg-[var(--color-surface-elevated)]'>
                    × {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={onClose} className='w-full text-[13px]'>
          Back to Workout
        </Button>
      </div>
    </div>
  );
};
