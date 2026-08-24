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
  CheckCircle2,
  X,
  Search,
  Dumbbell,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Data Models
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

interface PlanSnapshot {
  id: string;
  name: string;
  timestamp: string;
  days: BuilderDay[];
}

// Exercise Library Catalog for Modal Picker
const EXERCISE_CATALOG = [
  { name: "Barbell Bench Press", category: "Chest" },
  { name: "Incline Dumbbell Press", category: "Upper Chest" },
  { name: "Barbell Back Squat", category: "Quads / Glutes" },
  { name: "Romanian Deadlift", category: "Posterior Chain" },
  { name: "Overhead Barbell Press", category: "Shoulders" },
  { name: "Lat Pulldown", category: "Back / Lats" },
  { name: "Seated Cable Row", category: "Mid-Back" },
  { name: "Barbell Curl", category: "Biceps" },
];

const INITIAL_DAYS: BuilderDay[] = [
  {
    id: "day-1",
    name: "Day 1: Upper Body Power",
    targetDay: "Mon",
    exercises: [
      {
        id: "ex-1",
        name: "Barbell Bench Press",
        category: "Chest",
        config: { id: 1, sets: 4, targetReps: 6, restSeconds: 180 },
      },
    ],
  },
  {
    id: "day-2",
    name: "Day 2: Lower Body Power",
    targetDay: "Wed",
    exercises: [
      {
        id: "ex-2",
        name: "Barbell Back Squat",
        category: "Quads / Glutes",
        config: { id: 2, sets: 4, targetReps: 5, restSeconds: 240 },
      },
    ],
  },
];

export default function WorkoutBuilderPage() {
  const [days, setDays] = useState<BuilderDay[]>(INITIAL_DAYS);
  const [selectedDayId, setSelectedDayId] = useState<string>("day-1");
  const [snapshots, setSnapshots] = useState<PlanSnapshot[]>([
    {
      id: "snap-1",
      name: "Week 1 Baseline",
      timestamp: "Yesterday 14:30",
      days: INITIAL_DAYS,
    },
  ]);

  // Modal & UI States
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snapshotName, setSnapshotName] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  const activeDay = days.find((d) => d.id === selectedDayId) || days[0];

  // 1. Add New Day Logic
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    const newDayId = `day-${Date.now()}`;
    const newDay: BuilderDay = {
      id: newDayId,
      name: `Day ${nextDayNum}: Accessory Session`,
      targetDay: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
        (days.length * 2) % 7
      ],
      exercises: [],
    };
    setDays([...days, newDay]);
    setSelectedDayId(newDayId);
  };

  // 2. Add Exercise from Modal
  const handleSelectExercise = (exerciseName: string, category: string) => {
    if (!activeDay) return;
    const newExercise: BuilderExercise = {
      id: `ex-${Date.now()}`,
      name: exerciseName,
      category,
      config: { id: Date.now(), sets: 3, targetReps: 10, restSeconds: 120 },
    };

    setDays(
      days.map((d) =>
        d.id === activeDay.id
          ? { ...d, exercises: [...d.exercises, newExercise] }
          : d,
      ),
    );
    setIsExerciseModalOpen(false);
    setSearchQuery("");
  };

  // 3. Duplicate Exercise
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

  // 4. Remove Exercise
  const handleRemoveExercise = (exerciseId: string) => {
    if (!activeDay) return;
    setDays(
      days.map((d) =>
        d.id === activeDay.id
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
          : d,
      ),
    );
  };

  // 5. Update Inline Stepper Configuration
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

  // 6. Save Snapshot Logic
  const handleCreateSnapshot = () => {
    if (!snapshotName.trim()) return;
    const newSnap: PlanSnapshot = {
      id: `snap-${Date.now()}`,
      name: snapshotName.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      days: JSON.parse(JSON.stringify(days)),
    };
    setSnapshots([newSnap, ...snapshots]);
    setSnapshotName("");
    setIsSnapshotModalOpen(false);
  };

  // 7. Restore Snapshot
  const handleRestoreSnapshot = (snap: PlanSnapshot) => {
    setDays(JSON.parse(JSON.stringify(snap.days)));
    if (snap.days.length > 0) {
      setSelectedDayId(snap.days[0].id);
    }
  };

  // 8. Publish Plan Logic
  const handlePublishPlan = () => {
    setIsPublished(true);
    setPublishMessage(
      "Workout Plan successfully published and assigned to your active training log!",
    );
    setTimeout(() => setPublishMessage(null), 4000);
  };

  const filteredExercises = EXERCISE_CATALOG.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Toast Banner for Publish Feedback */}
        {publishMessage && (
          <div className='p-4 rounded-sm bg-[var(--color-surface-elevated-2)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] flex items-center justify-between animate-in fade-in'>
            <div className='flex items-center gap-2 text-[14px]'>
              <CheckCircle2 className='h-4 w-4' />
              <span>{publishMessage}</span>
            </div>
            <button onClick={() => setPublishMessage(null)}>
              <X className='h-4 w-4' />
            </button>
          </div>
        )}

        {/* Builder Header with Versioning Snapshot Controls */}
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
                {isPublished && (
                  <span className='px-2 py-0.5 rounded-sm bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] text-[11px] font-mono font-semibold text-[var(--color-accent-primary)]'>
                    ACTIVE PLAN
                  </span>
                )}
              </div>

              {/* Snapshot Select Control */}
              <div className='flex items-center gap-2 mt-1'>
                <History className='h-3.5 w-3.5 text-[var(--color-text-muted)]' />
                <span className='text-[12px] text-[var(--color-text-muted)]'>
                  Snapshot:
                </span>
                <select
                  onChange={(e) => {
                    const snap = snapshots.find((s) => s.id === e.target.value);
                    if (snap) handleRestoreSnapshot(snap);
                  }}
                  className='bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded text-[12px] text-[var(--color-text-secondary)] px-2 py-0.5 focus:outline-none'
                >
                  {snapshots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.timestamp})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              onClick={() => setIsSnapshotModalOpen(true)}
              className='gap-2 text-[13px]'
            >
              <Save className='h-4 w-4' />
              <span>Save Snapshot</span>
            </Button>
            <Button onClick={handlePublishPlan} className='gap-2 text-[13px]'>
              <span>Publish Plan</span>
            </Button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Day Navigation Rail */}
          <div className='lg:col-span-1 space-y-3'>
            <div className='flex items-center justify-between px-1'>
              <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
                Plan Structure
              </span>
              <button
                type='button'
                onClick={handleAddDay}
                className='text-[12px] text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 cursor-pointer'
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

          {/* Main Exercise Editor */}
          <div className='lg:col-span-3 space-y-4'>
            {activeDay ? (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between border-b border-[var(--color-border-default)] pb-4'>
                  <div>
                    <CardTitle className='text-[20px]'>
                      {activeDay.name}
                    </CardTitle>
                    <p className='text-[13px] text-[var(--color-text-secondary)] mt-0.5'>
                      Target Schedule:{" "}
                      <span className='font-mono text-[var(--color-accent-primary)]'>
                        {activeDay.targetDay}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant='secondary'
                    size='default'
                    onClick={() => setIsExerciseModalOpen(true)}
                    className='gap-2 text-[13px]'
                  >
                    <Plus className='h-4 w-4' />
                    <span>Add Exercise</span>
                  </Button>
                </CardHeader>

                <CardContent className='pt-4 space-y-3'>
                  {activeDay.exercises.length === 0 ? (
                    <div className='p-8 text-center border border-dashed border-[var(--color-border-default)] rounded-sm'>
                      <Dumbbell className='h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2' />
                      <p className='text-[14px] text-[var(--color-text-secondary)]'>
                        No exercises configured for this day yet.
                      </p>
                      <Button
                        variant='ghost'
                        onClick={() => setIsExerciseModalOpen(true)}
                        className='mt-2 text-[13px] text-[var(--color-accent-primary)]'
                      >
                        + Select Exercise from Library
                      </Button>
                    </div>
                  ) : (
                    activeDay.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className='p-4 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] space-y-3 hover:border-[var(--color-border-strong)] transition-colors'
                      >
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
                              className='p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer'
                            >
                              <Copy className='h-4 w-4' />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleRemoveExercise(ex.id)}
                              aria-label='Remove exercise'
                              className='p-2 rounded-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>

                        {/* Inline Set Steppers */}
                        <div className='grid grid-cols-3 gap-3 pt-2 border-t border-[var(--color-border-default)]'>
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
                                onClick={() =>
                                  handleUpdateConfig(ex.id, "sets", 1)
                                }
                                className='w-6 h-6 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] flex items-center justify-center font-mono text-[14px]'
                              >
                                +
                              </button>
                            </div>
                          </div>

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
                    ))
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal 1: Add Exercise Catalog Picker */}
      {isExerciseModalOpen && (
        <div className='fixed inset-0 z-50 bg-[#0E1113]/70 flex items-center justify-center p-4'>
          <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[480px] space-y-4 p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h3 className='text-[18px] font-semibold text-[var(--color-text-primary)] font-display'>
                Select Exercise
              </h3>
              <button onClick={() => setIsExerciseModalOpen(false)}>
                <X className='h-5 w-5 text-[var(--color-text-muted)]' />
              </button>
            </div>

            <div className='relative'>
              <Search className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
              <input
                type='text'
                placeholder='Search exercise or muscle group...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
              />
            </div>

            <div className='max-h-[280px] overflow-y-auto space-y-1'>
              {filteredExercises.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectExercise(ex.name, ex.category)}
                  className='w-full text-left p-3 rounded-sm hover:bg-[var(--color-surface-elevated-2)] border border-transparent hover:border-[var(--color-border-default)] flex items-center justify-between transition-colors'
                >
                  <div>
                    <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                      {ex.name}
                    </h4>
                    <span className='text-[12px] text-[var(--color-text-muted)]'>
                      {ex.category}
                    </span>
                  </div>
                  <Plus className='h-4 w-4 text-[var(--color-accent-primary)]' />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Save Version Snapshot */}
      {isSnapshotModalOpen && (
        <div className='fixed inset-0 z-50 bg-[#0E1113]/70 flex items-center justify-center p-4'>
          <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[400px] space-y-4 p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h3 className='text-[18px] font-semibold text-[var(--color-text-primary)] font-display'>
                Save Spec Snapshot
              </h3>
              <button onClick={() => setIsSnapshotModalOpen(false)}>
                <X className='h-5 w-5 text-[var(--color-text-muted)]' />
              </button>
            </div>

            <div className='space-y-2'>
              <label className='text-[12px] font-mono text-[var(--color-text-secondary)] uppercase'>
                Snapshot Name
              </label>
              <input
                type='text'
                placeholder='e.g. Deload Week Baseline'
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
              />
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='ghost'
                onClick={() => setIsSnapshotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateSnapshot}>Save Snapshot</Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
