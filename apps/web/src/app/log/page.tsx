"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, MessageSquare, Check, SkipForward } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

interface SetData {
  id: number;
  weight: number;
  reps: number;
  completed: boolean;
}

const INITIAL_SETS: SetData[] = [
  { id: 1, weight: 80, reps: 8, completed: true },
  { id: 2, weight: 82.5, reps: 8, completed: true },
  { id: 3, weight: 85, reps: 6, completed: false },
  { id: 4, weight: 85, reps: 6, completed: false },
];

export default function WorkoutLoggerPage() {
  const [sets, setSets] = useState<SetData[]>(INITIAL_SETS);
  const [currentSetIndex, setCurrentSetIndex] = useState(2); // Set 3 active
  const [weight, setWeight] = useState(85);
  const [reps, setReps] = useState(6);
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Synchronize stepper values with selected set
  useEffect(() => {
    const activeSet = sets[currentSetIndex];
    if (activeSet) {
      setWeight(activeSet.weight);
      setReps(activeSet.reps);
    }
  }, [currentSetIndex, sets]);

  // Rest Timer Countdown Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restSeconds > 0) {
      timer = setInterval(() => setRestSeconds((prev) => prev - 1), 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
    }
    return () => clearInterval(timer);
  }, [isResting, restSeconds]);

  const handleCompleteSet = () => {
    // Update active set
    const updatedSets = [...sets];
    updatedSets[currentSetIndex] = {
      ...updatedSets[currentSetIndex],
      weight,
      reps,
      completed: true,
    };
    setSets(updatedSets);

    // Trigger Rest Timer (90 seconds)
    setRestSeconds(90);
    setIsResting(true);

    // Advance to next set if available
    if (currentSetIndex < sets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  const currentSet = sets[currentSetIndex];

  return (
    <AppShell>
      {/* Logger constrained to 480px max width per Section 7 & 10 */}
      <div className="max-w-[480px] mx-auto space-y-5 pb-6">
        {/* Top Header & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-[12px] font-mono font-medium text-[var(--color-accent-primary)] uppercase tracking-wider">
            Upper Body Power • 3/5 Exercises
          </span>
        </div>

        {/* 1. Exercise Name & Swap Affordance (Section 10.1) */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <h1 className="font-display text-[24px] md:text-[28px] font-semibold leading-tight text-[var(--color-text-primary)]">
              Barbell Bench Press
            </h1>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
              Primary Chest / Front Delts • RPE 8.5
            </p>
          </div>
          <button
            type="button"
            aria-label="Swap exercise"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Swap</span>
          </button>
        </div>

        {/* 2. Set Indicator Chips Row (Section 10.2) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sets.map((set, index) => {
            const isActive = index === currentSetIndex;
            return (
              <button
                key={set.id}
                type="button"
                onClick={() => setCurrentSetIndex(index)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm border text-[13px] font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold"
                    : set.completed
                    ? "bg-[var(--color-bg-secondary)] border-[var(--color-border-default)] text-[var(--color-text-primary)]"
                    : "bg-[var(--color-bg-primary)] border-[var(--color-border-default)] text-[var(--color-text-muted)]"
                }`}
              >
                {set.completed ? (
                  <ApertureIrisProgress value={100} size={18} />
                ) : (
                  <span>SET {set.id}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Weight and Rep Steppers Cluster (Section 10.3) */}
        <Card className="p-4 space-y-4">
          <NumericStepper
            label="Load Weight"
            value={weight}
            onChange={setWeight}
            step={2.5}
            unit="kg"
          />
          <NumericStepper
            label="Completed Repetitions"
            value={reps}
            onChange={setReps}
            step={1}
            unit="reps"
          />
        </Card>

        {/* 4. Rest Timer Card (Section 10.4 & Section 8) */}
        {isResting && (
          <Card className="border-[var(--color-accent-primary)]/40 bg-[var(--color-bg-secondary)] p-4 flex items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <ApertureIrisProgress
                value={((90 - restSeconds) / 90) * 100}
                size={44}
              />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Rest Interval
                </span>
                <div className="tabular-nums text-[24px] font-medium leading-none text-[var(--color-text-primary)]">
                  {Math.floor(restSeconds / 60)}:
                  {String(restSeconds % 60).padStart(2, "0")}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsResting(false)}
              className="gap-1.5 text-[13px]"
            >
              <SkipForward className="h-4 w-4" />
              <span>Skip Rest</span>
            </Button>
          </Card>
        )}

        {/* 5. Fixed-Position Thumb-Zone Primary CTA (Section 10.5) */}
        <div className="pt-2">
          <Button
            size="logger"
            onClick={handleCompleteSet}
            className="w-full h-[52px] text-[16px] gap-2 font-semibold shadow-lg"
          >
            <Check className="h-5 w-5 stroke-[2.5]" />
            <span>Complete Set {currentSet?.id}</span>
          </Button>
        </div>

        {/* 6. Collapsed Notes Trigger (Section 10.6) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-[var(--color-text-muted)]" />
            <span>{showNotes ? "Hide Exercise Notes" : "Add Exercise Note"}</span>
          </button>

          {showNotes && (
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Pause at chest was clean on set 2..."
              rows={3}
              className="mt-2.5 w-full rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] p-3 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-primary)] focus:outline-none transition-colors"
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}