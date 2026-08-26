"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Save,
  CheckCircle2,
  X,
  Search,
  Dumbbell,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAppStore, CustomExercise } from "@/store/app-store";

export default function WorkoutBuilderPage() {
  const {
    plans,
    customExercises,
    createCustomPlan,
    addDayToPlan,
    addExerciseToDay,
    updateSetInPlan,
    setActivePlan,
    deletePlan,
    addCustomExercise,
  } = useAppStore();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans[0]?.id || "",
  );
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isCustomExModalOpen, setIsCustomExModalOpen] = useState(false);

  // New Form Inputs
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customExName, setCustomExName] = useState("");
  const [customExCategory, setCustomExCategory] = useState("Chest");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const activeDay =
    activePlan?.days.find((d) => d.id === selectedDayId) || activePlan?.days[0];

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) return;
    const newId = createCustomPlan(newPlanName, newPlanDesc);
    setSelectedPlanId(newId);
    setNewPlanName("");
    setNewPlanDesc("");
    setIsNewPlanModalOpen(false);
    showToast("Custom routine created! Add your first day below.");
  };

  const handleAddDay = () => {
    if (!activePlan) return;
    const dayNum = activePlan.days.length + 1;
    const targetDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const targetDay = targetDays[(activePlan.days.length * 2) % 7];
    addDayToPlan(activePlan.id, `Day ${dayNum}: Custom Split`, targetDay);
    showToast(`Day ${dayNum} added to ${activePlan.name}`);
  };

  const handleSelectExercise = (ex: CustomExercise) => {
    if (!activePlan || !activeDay) return;
    addExerciseToDay(activePlan.id, activeDay.id, ex);
    setIsExerciseModalOpen(false);
    showToast(`Added ${ex.name} to ${activeDay.name}`);
  };

  const handleCreateCustomExercise = () => {
    if (!customExName.trim()) return;
    addCustomExercise(
      customExName,
      customExCategory,
      "Custom",
      "Target Muscle",
    );
    setCustomExName("");
    setIsCustomExModalOpen(false);
    showToast("Custom movement added to exercise library!");
  };

  const handlePublishPlan = () => {
    if (!activePlan) return;
    setActivePlan(activePlan.id);
    showToast(`${activePlan.name} is now set as your active gym program!`);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredExercises = customExercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Toast Feedback Banner */}
        {toastMsg && (
          <div className='p-3.5 rounded-sm bg-[var(--color-surface-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] flex items-center justify-between text-[13px] font-mono animate-in fade-in'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 flex-shrink-0' />
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)}>
              <X className='h-4 w-4' />
            </button>
          </div>
        )}

        {/* Builder Header */}
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
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className='bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm font-display text-[20px] font-semibold text-[var(--color-text-primary)] px-2 py-1 focus:outline-none focus:border-[var(--color-accent-primary)]'
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isActive ? "(ACTIVE)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <p className='text-[12px] text-[var(--color-text-muted)] mt-0.5'>
                {activePlan?.description}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='secondary'
              onClick={() => setIsNewPlanModalOpen(true)}
              className='gap-2 text-[13px]'
            >
              <Plus className='h-4 w-4' />
              <span>New Routine Spec</span>
            </Button>
            <Button onClick={handlePublishPlan} className='gap-2 text-[13px]'>
              <span>Set as Active Program</span>
            </Button>
          </div>
        </div>

        {/* Builder Workspace */}
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Day Navigation Rail */}
          <div className='lg:col-span-1 space-y-3'>
            <div className='flex items-center justify-between px-1'>
              <span className='text-[12px] font-mono text-[var(--color-text-secondary)] uppercase'>
                Program Days
              </span>
              <button
                type='button'
                onClick={handleAddDay}
                className='text-[12px] font-mono text-[var(--color-accent-primary)] hover:underline flex items-center gap-1 cursor-pointer'
              >
                <Plus className='h-3.5 w-3.5' /> Add Day
              </button>
            </div>

            <div className='space-y-1.5'>
              {activePlan?.days.map((day) => {
                const isActive = activeDay?.id === day.id;
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
                    <div className='flex items-center gap-2'>
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

          {/* Main Exercise Spec Editor */}
          <div className='lg:col-span-3 space-y-4'>
            {activeDay ? (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between border-b border-[var(--color-border-default)] pb-4'>
                  <div>
                    <CardTitle className='text-[20px]'>
                      {activeDay.name}
                    </CardTitle>
                    <p className='text-[12px] text-[var(--color-text-secondary)] mt-0.5 font-mono'>
                      Target Schedule:{" "}
                      <span className='text-[var(--color-accent-primary)]'>
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
                    <div className='p-8 text-center border border-dashed border-[var(--color-border-default)] rounded-sm space-y-3'>
                      <Dumbbell className='h-8 w-8 text-[var(--color-text-muted)] mx-auto' />
                      <p className='text-[14px] text-[var(--color-text-secondary)]'>
                        No exercises configured for {activeDay.name} yet.
                      </p>
                      <Button
                        variant='ghost'
                        onClick={() => setIsExerciseModalOpen(true)}
                        className='text-[13px] text-[var(--color-accent-primary)]'
                      >
                        + Select Exercise from Catalog
                      </Button>
                    </div>
                  ) : (
                    activeDay.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className='p-4 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] space-y-3 hover:border-[var(--color-border-strong)] transition-colors'
                      >
                        <div className='flex items-center justify-between gap-2'>
                          <div>
                            <h3 className='text-[15px] font-semibold text-[var(--color-text-primary)]'>
                              {ex.name}
                            </h3>
                            <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                              {ex.category}
                            </span>
                          </div>
                        </div>

                        {/* Set Configurations */}
                        <div className='space-y-2 pt-1 border-t border-[var(--color-border-default)]'>
                          {ex.sets.map((set, sIdx) => (
                            <div
                              key={set.id}
                              className='grid grid-cols-3 gap-3 p-2 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] items-center'
                            >
                              <div className='flex items-center justify-between px-2'>
                                <span className='text-[11px] font-mono text-[var(--color-text-muted)]'>
                                  SET {sIdx + 1}
                                </span>
                                <span className='text-[12px] font-mono font-medium'>
                                  {set.weight} kg
                                </span>
                              </div>

                              <div className='flex items-center justify-between px-2'>
                                <span className='text-[11px] font-mono text-[var(--color-text-muted)]'>
                                  REPS
                                </span>
                                <input
                                  type='number'
                                  value={set.targetReps}
                                  onChange={(e) =>
                                    updateSetInPlan(
                                      activePlan.id,
                                      activeDay.id,
                                      ex.id,
                                      sIdx,
                                      "targetReps",
                                      Number(e.target.value),
                                    )
                                  }
                                  className='w-12 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded px-1 text-center text-[13px] font-mono text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                                />
                              </div>

                              <div className='flex items-center justify-between px-2'>
                                <span className='text-[11px] font-mono text-[var(--color-text-muted)] flex items-center gap-1'>
                                  <Clock className='h-3 w-3' /> REST
                                </span>
                                <span className='text-[12px] font-mono text-[var(--color-text-primary)]'>
                                  {set.restSeconds}s
                                </span>
                              </div>
                            </div>
                          ))}
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

      {/* Modal 1: Select Exercise Catalog Picker */}
      {isExerciseModalOpen && (
        <div className='fixed inset-0 z-50 bg-[#0E1113]/80 backdrop-blur-xs flex items-center justify-center p-4'>
          <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[480px] space-y-4 p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h3 className='text-[18px] font-semibold text-[var(--color-text-primary)] font-display'>
                Select Exercise
              </h3>
              <button onClick={() => setIsExerciseModalOpen(false)}>
                <X className='h-5 w-5 text-[var(--color-text-muted)]' />
              </button>
            </div>

            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <Search className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='text'
                  placeholder='Search exercise catalog...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
              <Button
                variant='secondary'
                onClick={() => setIsCustomExModalOpen(true)}
                className='text-[12px] px-2.5 whitespace-nowrap'
              >
                + Custom Movement
              </Button>
            </div>

            <div className='max-h-[280px] overflow-y-auto space-y-1'>
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className='w-full text-left p-3 rounded-sm hover:bg-[var(--color-surface-elevated-2)] border border-transparent hover:border-[var(--color-border-default)] flex items-center justify-between transition-colors cursor-pointer'
                >
                  <div>
                    <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                      {ex.name}
                    </h4>
                    <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                      {ex.category} • {ex.equipment}
                    </span>
                  </div>
                  <Plus className='h-4 w-4 text-[var(--color-accent-primary)]' />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Custom Routine */}
      {isNewPlanModalOpen && (
        <div className='fixed inset-0 z-50 bg-[#0E1113]/80 backdrop-blur-xs flex items-center justify-center p-4'>
          <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[420px] space-y-4 p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h3 className='text-[18px] font-semibold text-[var(--color-text-primary)] font-display'>
                Create Routine Spec
              </h3>
              <button onClick={() => setIsNewPlanModalOpen(false)}>
                <X className='h-5 w-5 text-[var(--color-text-muted)]' />
              </button>
            </div>

            <div className='space-y-3'>
              <div className='space-y-1'>
                <label className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                  Routine Name
                </label>
                <input
                  type='text'
                  placeholder='e.g. 5-Day Push/Pull/Legs Hypertrophy'
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>

              <div className='space-y-1'>
                <label className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                  Description
                </label>
                <input
                  type='text'
                  placeholder='e.g. Focused on compound progression'
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='ghost'
                onClick={() => setIsNewPlanModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Routine</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Custom Exercise Creator */}
      {isCustomExModalOpen && (
        <div className='fixed inset-0 z-50 bg-[#0E1113]/80 backdrop-blur-xs flex items-center justify-center p-4'>
          <div className='bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-md w-full max-w-[400px] space-y-4 p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h3 className='text-[18px] font-semibold text-[var(--color-text-primary)] font-display'>
                Add Custom Movement
              </h3>
              <button onClick={() => setIsCustomExModalOpen(false)}>
                <X className='h-5 w-5 text-[var(--color-text-muted)]' />
              </button>
            </div>

            <div className='space-y-3'>
              <div className='space-y-1'>
                <label className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                  Movement Name
                </label>
                <input
                  type='text'
                  placeholder='e.g. Deficit Reverse Lunge'
                  value={customExName}
                  onChange={(e) => setCustomExName(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>

              <div className='space-y-1'>
                <label className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                  Body Group
                </label>
                <select
                  value={customExCategory}
                  onChange={(e) => setCustomExCategory(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                >
                  {[
                    "Chest",
                    "Back",
                    "Quads",
                    "Posterior Chain",
                    "Shoulders",
                    "Arms",
                    "Core",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                variant='ghost'
                onClick={() => setIsCustomExModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCustomExercise}>
                Add to Library
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
