"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Copy,
  Trash2,
  Clock,
  History,
  Save,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ConfiguredSet {
  id: number;
  sets: number;
  targetReps: number;
  restSeconds: number;
}

interface BuilderExercise {
  id: string;
  name: string;
  category: string;
  config: ConfiguredSet;
}

interface BuilderDay {
  id: string;
  name: string;
  targetDay: string;
  exercises: BuilderExercise[];
}

const INITIAL_DAYS: BuilderDay[] = [
  {
    id: "day-1",
    name: "Day 1: Upper Body Power",
    targetDay: "Mon",
    exercises: [
      {
        id: "ex-1",
        name: "Barbell Bench Press",
        category: "Chest / Delts",
        config: { id: 1, sets: 4, targetReps: 6, restSeconds: 180 },
      },
      {
        id: "ex-2",
        name: "Incline Dumbbell Press",
        category: "Upper Chest",
        config: { id: 2, sets: 3, targetReps: 10, restSeconds: 120 },
      },
    ],
  },
  {
    id: "day-2",
    name: "Day 2: Lower Body Power",
    targetDay: "Wed",
    exercises: [
      {
        id: "ex-3",
        name: "Barbell Back Squat",
        category: "Quads / Glutes",
        config: { id: 3, sets: 4, targetReps: 5, restSeconds: 240 },
      },
    ],
  },
];

export default function WorkoutBuilderPage() {
  const [days, setDays] = useState<BuilderDay[]>(INITIAL_DAYS);
  const [selectedDayId, setSelectedDayId] = useState<string>("day-1");
  const [lastSaved, setLastSaved] = useState("Just now");

  const activeDay = days.find((d) => d.id === selectedDayId) || days[0];

  const handleDuplicateExercise = (exerciseId: string) => {
    if (!activeDay) return;
    const targetEx = activeDay.exercises.find((e) => e.id === exerciseId);
    if (!targetEx) return;

    const duplicated: BuilderExercise = {
      ...targetEx,
      id: `ex-${Date.now()}`,
      name: `Copy of ${targetEx.name}`,
    };

    setDays(
      days.map((d) =>
        d.id === activeDay.id
          ? { ...d, exercises: [...d.exercises, duplicated] }
          : d,
      ),
    );
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!activeDay) return;
    setDays(
      days.map((d) =>
        d.id === activeDay.id
          ? {
              ...d,
              exercises: d.exercises.filter((e) => e.id !== exerciseId),
            }
          : d,
      ),
    );
  };

  const handleUpdateConfig = (
    exerciseId: string,
    field: keyof ConfiguredSet,
    delta: number,
  ) => {
    setDays(
      days.map((d) => {
        if (d.id !== activeDay.id) return d;
        return {
          ...d,
          exercises: d.exercises.map((e) => {
            if (e.id !== exerciseId) return e;
            const currentVal = e.config[field];
            const newVal = Math.max(1, currentVal + delta);
            return {
              ...e,
              config: { ...e.config, [field]: newVal },
            };
          }),
        };
      }),
    );
  };

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header with Versioning Snapshot Dropdown (Section 11) */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-default)] pb-4'>
          <div className='flex items-center gap-3'>
            <Link
              href='/dashboard'
              className='p-1.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors'
            >
              <ArrowLeft className='h-4 w-4' />
            </Link>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='font-display text-[24px] font-semibold text-[var(--color-text-primary)]'>
                  Hypertrophy Spec Builder
                </h1>
                <span className='px-2 py-0.5 rounded-sm bg-[var(--color-surface-elevated-2)] border border-[var(--color-border-default)] text-[11px] font-mono text-[var(--color-text-muted)]'>
                  v1.2
                </span>
              </div>
              <span className='text-[12px] text-[var(--color-text-muted)] flex items-center gap-1.5 mt-0.5'>
                <History className='h-3.5 w-3.5' />
                Last edited: {lastSaved}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='secondary' className='gap-2 text-[13px]'>
              <Save className='h-4 w-4' />
              <span>Save Snapshot</span>
            </Button>
            <Button className='gap-2 text-[13px]'>
              <span>Publish Plan</span>
            </Button>
          </div>
        </div>

        {/* Builder Layout: Persistent Tree Rail + Main Editor (Section 11 & 14) */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Day Navigation Rail (Tree Level) */}
          <div className='lg:col-span-1 space-y-3'>
            <div className='flex items-center justify-between px-1'>
              <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
                Plan Structure
              </span>
              <button
                type='button'
                className='text-[12px] text-[var(--color-accent-primary)] hover:underline flex items-center gap-1'
              >
                <Plus className='h-3.5 w-3.5' /> Add Day
              </button>
            </div>

            <div className='space-y-1.5'>
              {days.map((day) => {
                const isActive = day.id === selectedDayId;
                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-sm border text-left text-[14px] transition-all cursor-pointer ${
                      isActive
                        ? "bg-[var(--color-accent-subtle)] border-[var(--color-accent-primary)] text-[var(--color-text-primary)] font-medium"
                        : "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div className='flex items-center gap-2.5'>
                      <GripVertical className='h-4 w-4 text-[var(--color-text-muted)] cursor-grab' />
                      <span>{day.name}</span>
                    </div>
                    <span className='tabular-nums text-[11px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-default)]'>
                      {day.exercises.length} ex
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail & Exercise Spec Editor (Main Content Pane) */}
          <div className='lg:col-span-3 space-y-4'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between border-b border-[var(--color-border-default)] pb-4'>
                <div>
                  <CardTitle className='text-[20px]'>
                    {activeDay.name}
                  </CardTitle>
                  <p className='text-[13px] text-[var(--color-text-secondary)] mt-0.5'>
                    Assigned Schedule:{" "}
                    <span className='font-mono text-[var(--color-accent-primary)]'>
                      {activeDay.targetDay}
                    </span>
                  </p>
                </div>
                <Button
                  variant='secondary'
                  size='default'
                  className='gap-2 text-[13px]'
                >
                  <Plus className='h-4 w-4' />
                  <span>Add Exercise</span>
                </Button>
              </CardHeader>

              <CardContent className='pt-4 space-y-3'>
                {activeDay.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className='p-4 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] space-y-3 hover:border-[var(--color-border-strong)] transition-colors'
                  >
                    {/* Exercise Item Header */}
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <GripVertical className='h-4 w-4 text-[var(--color-text-muted)] cursor-grab' />
                        <div>
                          <h3 className='text-[15px] font-semibold text-[var(--color-text-primary)]'>
                            {ex.name}
                          </h3>
                          <span className='text-[12px] text-[var(--color-text-muted)]'>
                            {ex.category}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => handleDuplicateExercise(ex.id)}
                          aria-label='Duplicate exercise'
                          className='p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors'
                        >
                          <Copy className='h-4 w-4' />
                        </button>
                        <button
                          type='button'
                          onClick={() => handleRemoveExercise(ex.id)}
                          aria-label='Remove exercise'
                          className='p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-elevated)] transition-colors'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>

                    {/* Inline Stepper Configuration Row (Section 11) */}
                    <div className='grid grid-cols-3 gap-3 pt-2 border-t border-[var(--color-border-default)]'>
                      {/* Sets Control */}
                      <div className='flex items-center justify-between p-2 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]'>
                        <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                          SETS
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() =>
                              handleUpdateConfig(ex.id, "sets", -1)
                            }
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[14px]'
                          >
                            -
                          </button>
                          <span className='tabular-nums font-mono text-[14px] text-[var(--color-text-primary)]'>
                            {ex.config.sets}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleUpdateConfig(ex.id, "sets", 1)}
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[14px]'
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Reps Control */}
                      <div className='flex items-center justify-between p-2 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]'>
                        <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                          REPS
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() =>
                              handleUpdateConfig(ex.id, "targetReps", -1)
                            }
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[14px]'
                          >
                            -
                          </button>
                          <span className='tabular-nums font-mono text-[14px] text-[var(--color-text-primary)]'>
                            {ex.config.targetReps}
                          </span>
                          <button
                            type='button'
                            onClick={() =>
                              handleUpdateConfig(ex.id, "targetReps", 1)
                            }
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[14px]'
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Rest Timer Control */}
                      <div className='flex items-center justify-between p-2 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)]'>
                        <span className='text-[12px] text-[var(--color-text-muted)] font-mono flex items-center gap-1'>
                          <Clock className='h-3 w-3' /> REST
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            type='button'
                            onClick={() =>
                              handleUpdateConfig(ex.id, "restSeconds", -30)
                            }
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[12px]'
                          >
                            -
                          </button>
                          <span className='tabular-nums font-mono text-[13px] text-[var(--color-text-primary)]'>
                            {ex.config.restSeconds}s
                          </span>
                          <button
                            type='button'
                            onClick={() =>
                              handleUpdateConfig(ex.id, "restSeconds", 30)
                            }
                            className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[12px]'
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
