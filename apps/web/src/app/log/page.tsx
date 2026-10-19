"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Calculator, Play, ChevronRight, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAppStore } from "@/store/app-store";
import { PlateCalculatorModal } from "@/components/ui/plate-calculator-modal";
import { WarmupCalculatorModal } from "@/components/ui/warmup-calculator-modal";
import { fetchApi } from "@/lib/api";

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
  const [weightOverride, setWeightOverride] = useState<number | null>(null);
  const [repsOverride, setRepsOverride] = useState<number | null>(null);
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [isWarmupCalcOpen, setIsWarmupCalcOpen] = useState(false);
  const selectedSet = activeWorkout?.exercises[activeExIndex]?.sets[activeSetIndex];
  const weight = weightOverride ?? selectedSet?.weight ?? 80;
  const reps = repsOverride ?? selectedSet?.targetReps ?? 8;

  const startSession = async (planId: string, dayId: string) => {
    const plan = plans.find((item) => item.id === planId);
    const day = plan?.days.find((item) => item.id === dayId);
    if (!plan || !day) return;
    await fetchApi("/workout-logger/start", {
      method: "POST",
      body: JSON.stringify({
        plan_id: plan.id,
        day_id: day.id,
        day_name: day.name,
        exercises: day.exercises.map((exercise) => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets.map((set) => ({ weight: set.weight, target_reps: set.targetReps })),
        })),
      }),
    });
    startWorkoutSession(planId, dayId);
  };

  const finishSession = async () => {
    await fetchApi("/workout-logger/finish", { method: "POST" });
    finishWorkoutSession();
  };

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
                  <p className='text-[12px] text-[var(--color-text-secondary)] font-mono'>
                    Active Program
                  </p>
                </div>
                <ApertureIrisProgress value={100} size={28} />
              </div>

              <div className='space-y-2'>
                {activePlan.days.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => { void startSession(activePlan.id, day.id).catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not start workout.")); }}
                    className='w-full flex items-center justify-between p-3.5 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] hover:border-[var(--color-accent-primary)] transition-colors text-left cursor-pointer group'
                  >
                    <div>
                      <h4 className='text-[15px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors'>
                        {day.name}
                      </h4>
                      <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
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

  const currentExercise = activeWorkout.exercises[activeExIndex];
  const currentSet = currentExercise?.sets[activeSetIndex];

  if (!currentExercise) {
    return (
      <AppShell>
        <Card className='mx-auto max-w-[480px] space-y-4 p-6 text-center'>
          <h1 className='font-display text-[24px] font-semibold'>This session has no exercises yet</h1>
          <p className='text-[14px] text-[var(--color-text-secondary)]'>Add exercises to this training day before starting your workout.</p>
          <Link href='/plans/builder'><Button className='w-full'>Open plan builder</Button></Link>
          <Button variant='secondary' className='w-full' onClick={() => { void finishSession().catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not finish workout.")); }}>End empty session</Button>
        </Card>
      </AppShell>
    );
  }

  const handleToggleSet = async () => {
    if (!currentExercise || !currentSet) return;
    await fetchApi("/workout-logger/toggle-set", {
      method: "POST",
      body: JSON.stringify({ exercise_index: activeExIndex, set_index: activeSetIndex, weight_kg: weight, completed_reps: reps }),
    });
    toggleSetCompletion(activeExIndex, activeSetIndex, weight, reps);

    if (activeSetIndex < currentExercise.sets.length - 1) {
      setActiveSetIndex(activeSetIndex + 1);
      setWeightOverride(null);
      setRepsOverride(null);
    } else if (activeExIndex < activeWorkout.exercises.length - 1) {
      setActiveExIndex(activeExIndex + 1);
      setActiveSetIndex(0);
      setWeightOverride(null);
      setRepsOverride(null);
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
            onClick={() => { void finishSession().catch((error: unknown) => window.alert(error instanceof Error ? error.message : "Could not finish workout.")); }}
            className='text-[12px] font-mono text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/40'
          >
            Finish Workout
          </Button>
        </div>

        {/* Exercise Title & Tools Bar */}
        <div className='flex items-start justify-between gap-2'>
          <div>
            <h1 className='font-display text-[26px] font-semibold text-[var(--color-text-primary)]'>
              {currentExercise?.name}
            </h1>
            <span className='text-[12px] text-[var(--color-text-secondary)] font-mono'>
              {currentExercise?.category} • Exercise {activeExIndex + 1} of{" "}
              {activeWorkout.exercises.length}
            </span>
          </div>

          <div className='flex items-center gap-1.5'>
            <button
              onClick={() => setIsWarmupCalcOpen(true)}
              aria-label='Warm-up Calculator'
              className='flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[12px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer'
            >
              <Flame className='h-3.5 w-3.5 text-[var(--color-accent-primary)]' />
              <span>Warmup</span>
            </button>
            <button
              onClick={() => setIsPlateCalcOpen(true)}
              aria-label='Plate Calculator'
              className='flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[12px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer'
            >
              <Calculator className='h-3.5 w-3.5 text-[var(--color-accent-primary)]' />
              <span>Plates</span>
            </button>
          </div>
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
                  setWeightOverride(null);
                  setRepsOverride(null);
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

        {/* Steppers */}
        <Card className='p-4 space-y-4'>
          <NumericStepper
            label='Load Weight'
            value={weight}
            onChange={setWeightOverride}
            step={2.5}
            unit='kg'
          />
          <NumericStepper
            label='Target Repetitions'
            value={reps}
            onChange={setRepsOverride}
            step={1}
            unit='reps'
          />
        </Card>

        {/* Set Completion Button */}
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

        {/* Navigation Rail */}
        <div className='flex items-center justify-between pt-2 border-t border-[var(--color-border-default)]'>
          <button
            disabled={activeExIndex === 0}
            onClick={() => {
              setActiveExIndex(activeExIndex - 1);
              setActiveSetIndex(0);
              setWeightOverride(null);
              setRepsOverride(null);
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
              setWeightOverride(null);
              setRepsOverride(null);
            }}
            className='text-[13px] font-mono text-[var(--color-accent-primary)] disabled:opacity-30 cursor-pointer'
          >
            Next Exercise →
          </button>
        </div>

        {/* Modals */}
        <PlateCalculatorModal
          isOpen={isPlateCalcOpen}
          onClose={() => setIsPlateCalcOpen(false)}
          targetWeight={weight}
        />
        <WarmupCalculatorModal
          isOpen={isWarmupCalcOpen}
          onClose={() => setIsWarmupCalcOpen(false)}
          workingWeight={weight}
        />
      </div>
    </AppShell>
  );
}
