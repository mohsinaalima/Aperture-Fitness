"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Calculator,
  Play,
  Plus,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAppStore } from "@/store/app-store";
import { PlateCalculatorModal } from "@/components/ui/plate-calculator-modal";

export default function WorkoutLoggerPage() {
  const {
    plans,
    activeWorkout,
    startWorkoutSession,
    toggleSetCompletion,
    finishWorkoutSession,
  } = useAppStore();

  const [activeExIndex, setActiveExIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(8);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);

  // If no session is active, show the Quick Start Selector
  if (!activeWorkout) {
    const activePlan = plans.find((p) => p.isActive) || plans[0];
    return (
      <AppShell>
        <div className='max-w-[480px] mx-auto space-y-6 pt-4'>
          <div className='text-center space-y-2'>
            <span className='text-[12px] font-mono text-[var(--color-accent-primary)] uppercase tracking-wider'>
              Gym Floor Logger
            </span>
            <h1 className='font-display text-[28px] font-semibold text-[var(--color-text-primary)]'>
              Select Workout Session
            </h1>
          </div>

          {activePlan && (
            <Card className='p-4 space-y-4 border-[var(--color-accent-primary)]/40'>
              <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
                <div>
                  <h3 className='font-display text-[18px] font-semibold text-[var(--color-text-primary)]'>
                    {activePlan.name}
                  </h3>
                  <p className='text-[12px] text-[var(--color-text-secondary)]'>
                    Active Assigned Program
                  </p>
                </div>
                <ApertureIrisProgress value={100} size={28} />
              </div>

              <div className='space-y-2'>
                {activePlan.days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => startWorkoutSession(activePlan.id, day.id)}
                    className='w-full flex items-center justify-between p-3.5 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] hover:border-[var(--color-accent-primary)] transition-colors text-left cursor-pointer group'
                  >
                    <div>
                      <h4 className='text-[15px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors'>
                        {day.name}
                      </h4>
                      <span className='text-[12px] text-[var(--color-text-muted)]'>
                        {day.exercises.length} exercises scheduled
                      </span>
                    </div>
                    <div className='flex items-center gap-1 text-[13px] font-semibold text-[var(--color-accent-primary)]'>
                      <Play className='h-4 w-4 fill-current' />
                      <span>Start</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <div className='text-center'>
            <Link
              href='/plans/builder'
              className='text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] inline-flex items-center gap-1'
            >
              <span>Create custom routine in Builder</span>
              <ChevronRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Active Logger Logic
  const currentExercise = activeWorkout.exercises[activeExIndex];
  const currentSet = currentExercise?.sets[activeSetIndex];

  const handleToggleSet = () => {
    if (!currentExercise || !currentSet) return;
    toggleSetCompletion(activeExIndex, activeSetIndex, weight, reps);

    // Advance to next set or exercise automatically
    if (activeSetIndex < currentExercise.sets.length - 1) {
      setActiveSetIndex(activeSetIndex + 1);
    } else if (activeExIndex < activeWorkout.exercises.length - 1) {
      setActiveExIndex(activeExIndex + 1);
      setActiveSetIndex(0);
    }
  };

  return (
    <AppShell>
      <div className='max-w-[480px] mx-auto space-y-5 pb-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <span className='text-[12px] font-mono font-semibold text-[var(--color-accent-primary)] uppercase'>
            {activeWorkout.dayName}
          </span>
          <Button
            variant='secondary'
            size='default'
            onClick={finishWorkoutSession}
            className='text-[12px] font-mono text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/40'
          >
            Finish Workout
          </Button>
        </div>

        {/* Exercise Header */}
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h1 className='font-display text-[26px] font-semibold text-[var(--color-text-primary)]'>
              {currentExercise?.name}
            </h1>
            <span className='text-[12px] text-[var(--color-text-secondary)]'>
              {currentExercise?.category} • Exercise {activeExIndex + 1} of{" "}
              {activeWorkout.exercises.length}
            </span>
          </div>

          <button
            onClick={() => setIsPlateCalcOpen(true)}
            aria-label='Plate Calculator'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[12px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer'
          >
            <Calculator className='h-3.5 w-3.5 text-[var(--color-accent-primary)]' />
            <span>Plates</span>
          </button>
        </div>

        {/* Set Chips Selector */}
        <div className='flex items-center gap-2 overflow-x-auto pb-1'>
          {currentExercise?.sets.map((set, idx) => {
            const isActive = idx === activeSetIndex;
            return (
              <button
                key={set.id}
                onClick={() => {
                  setActiveSetIndex(idx);
                  setWeight(set.weight);
                  setReps(set.targetReps);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-sm border text-[13px] font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold"
                    : set.completed
                      ? "bg-[var(--color-bg-secondary)] border-[var(--color-border-default)] text-[var(--color-text-primary)]"
                      : "bg-[var(--color-bg-primary)] border-[var(--color-border-default)] text-[var(--color-text-muted)]"
                }`}
              >
                {set.completed ? (
                  <ApertureIrisProgress value={100} size={16} />
                ) : (
                  <span>SET {idx + 1}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Weight & Rep Steppers */}
        <Card className='p-4 space-y-4'>
          <NumericStepper
            label='Load Weight'
            value={weight}
            onChange={setWeight}
            step={2.5}
            unit='kg'
          />
          <NumericStepper
            label='Target Repetitions'
            value={reps}
            onChange={setReps}
            step={1}
            unit='reps'
          />
        </Card>

        {/* Primary Set Completion Button */}
        <Button
          size='logger'
          onClick={handleToggleSet}
          className='w-full h-[52px] text-[16px] gap-2 font-semibold shadow-lg'
        >
          <Check className='h-5 w-5 stroke-[2.5]' />
          <span>
            {currentSet?.completed
              ? `Update Set ${activeSetIndex + 1}`
              : `Complete Set ${activeSetIndex + 1}`}
          </span>
        </Button>

        {/* Exercise Switch Rail */}
        <div className='flex items-center justify-between pt-2 border-t border-[var(--color-border-default)]'>
          <button
            disabled={activeExIndex === 0}
            onClick={() => {
              setActiveExIndex(activeExIndex - 1);
              setActiveSetIndex(0);
            }}
            className='text-[13px] font-mono text-[var(--color-text-secondary)] disabled:opacity-30 cursor-pointer'
          >
            ← Previous Exercise
          </button>
          <button
            disabled={activeExIndex === activeWorkout.exercises.length - 1}
            onClick={() => {
              setActiveExIndex(activeExIndex + 1);
              setActiveSetIndex(0);
            }}
            className='text-[13px] font-mono text-[var(--color-accent-primary)] disabled:opacity-30 cursor-pointer'
          >
            Next Exercise →
          </button>
        </div>

        {/* Plate Calculator Modal */}
        <PlateCalculatorModal
          isOpen={isPlateCalcOpen}
          onClose={() => setIsPlateCalcOpen(false)}
          targetWeight={weight}
        />
      </div>
    </AppShell>
  );
}
