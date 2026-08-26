"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomExercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primaryMuscle: string;
}

export interface SetSpec {
  id: string;
  targetReps: number;
  weight: number;
  restSeconds: number;
  rpe?: number;
  completed?: boolean;
  isWarmup?: boolean;
}

export interface ExerciseSpec {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  sets: SetSpec[];
}

export interface DaySpec {
  id: string;
  name: string;
  targetDay: string;
  exercises: ExerciseSpec[];
}

export interface RoutinePlan {
  id: string;
  name: string;
  description: string;
  isCustom: boolean;
  isActive: boolean;
  days: DaySpec[];
  createdAt: string;
}

export interface CompletedSession {
  id: string;
  planName: string;
  dayName: string;
  completedAt: string;
  totalVolumeKg: number;
  durationMinutes: number;
  loggedSetsCount: number;
}

interface AppState {
  // Master Collections
  plans: RoutinePlan[];
  customExercises: CustomExercise[];
  completedSessions: CompletedSession[];
  
  // Active Gym Floor Workout State
  activeWorkout: {
    planId: string;
    dayId: string;
    dayName: string;
    startTime: number | null;
    exercises: ExerciseSpec[];
    activeRestTimer: { endTime: number; duration: number } | null;
  } | null;

  // Actions: Routine Builder
  createCustomPlan: (name: string, description: string) => string;
  addDayToPlan: (planId: string, dayName: string, targetDay: string) => void;
  addExerciseToDay: (planId: string, dayId: string, exercise: CustomExercise) => void;
  updateSetInPlan: (planId: string, dayId: string, exerciseId: string, setIndex: number, field: keyof SetSpec, value: number) => void;
  setActivePlan: (planId: string) => void;
  deletePlan: (planId: string) => void;
  addCustomExercise: (name: string, category: string, equipment: string, primaryMuscle: string) => void;

  // Actions: Gym Floor Active Logging
  startWorkoutSession: (planId: string, dayId: string) => void;
  toggleSetCompletion: (exerciseIndex: number, setIndex: number, weight: number, reps: number) => void;
  triggerRestTimer: (seconds: number) => void;
  cancelRestTimer: () => void;
  finishWorkoutSession: () => void;
}

const DEFAULT_EXERCISES: CustomExercise[] = [
  { id: "ex-1", name: "Barbell Bench Press", category: "Chest", equipment: "Barbell", primaryMuscle: "Pectoralis Major" },
  { id: "ex-2", name: "Barbell Back Squat", category: "Quads", equipment: "Barbell", primaryMuscle: "Quadriceps" },
  { id: "ex-3", name: "Romanian Deadlift", category: "Posterior Chain", equipment: "Barbell", primaryMuscle: "Hamstrings" },
  { id: "ex-4", name: "Incline Dumbbell Press", category: "Chest", equipment: "Dumbbell", primaryMuscle: "Upper Chest" },
  { id: "ex-5", name: "Overhead Barbell Press", category: "Shoulders", equipment: "Barbell", primaryMuscle: "Anterior Deltoid" },
  { id: "ex-6", name: "Lat Pulldown", category: "Back", equipment: "Cable", primaryMuscle: "Latissimus Dorsi" },
];

const DEFAULT_PLANS: RoutinePlan[] = [
  {
    id: "plan-default-1",
    name: "Hypertrophy Block A",
    description: "4-Day Upper/Lower Strength & Mass Hypertrophy Program",
    isCustom: false,
    isActive: true,
    createdAt: "2026-08-01",
    days: [
      {
        id: "day-1",
        name: "Day 1: Upper Power",
        targetDay: "Mon",
        exercises: [
          {
            id: "ps-1",
            exerciseId: "ex-1",
            name: "Barbell Bench Press",
            category: "Chest",
            sets: [
              { id: "s1", targetReps: 8, weight: 80, restSeconds: 180, completed: false },
              { id: "s2", targetReps: 8, weight: 82.5, restSeconds: 180, completed: false },
              { id: "s3", targetReps: 6, weight: 85, restSeconds: 180, completed: false },
            ],
          },
        ],
      },
    ],
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      customExercises: DEFAULT_EXERCISES,
      completedSessions: [
        {
          id: "hist-1",
          planName: "Hypertrophy Block A",
          dayName: "Day 1: Upper Power",
          completedAt: "2026-08-25T10:30:00.000Z",
          totalVolumeKg: 24200,
          durationMinutes: 52,
          loggedSetsCount: 16,
        },
      ],
      activeWorkout: null,

      // Plan Builder Implementation
      createCustomPlan: (name, description) => {
        const newPlanId = `plan-custom-${Date.now()}`;
        const newPlan: RoutinePlan = {
          id: newPlanId,
          name: name.trim() || "Custom Routine Spec",
          description: description.trim() || "User defined gym protocol",
          isCustom: true,
          isActive: false,
          createdAt: new Date().toISOString().split("T")[0],
          days: [],
        };

        set((state) => ({ plans: [newPlan, ...state.plans] }));
        return newPlanId;
      },

      addDayToPlan: (planId, dayName, targetDay) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            const newDay: DaySpec = {
              id: `day-${Date.now()}`,
              name: dayName || `Day ${p.days.length + 1}`,
              targetDay: targetDay || "Mon",
              exercises: [],
            };
            return { ...p, days: [...p.days, newDay] };
          }),
        }));
      },

      addExerciseToDay: (planId, dayId, exercise) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                const newEx: ExerciseSpec = {
                  id: `exspec-${Date.now()}`,
                  exerciseId: exercise.id,
                  name: exercise.name,
                  category: exercise.category,
                  sets: [
                    { id: `s-${Date.now()}-1`, targetReps: 10, weight: 60, restSeconds: 120, completed: false },
                    { id: `s-${Date.now()}-2`, targetReps: 10, weight: 60, restSeconds: 120, completed: false },
                    { id: `s-${Date.now()}-3`, targetReps: 10, weight: 60, restSeconds: 120, completed: false },
                  ],
                };
                return { ...d, exercises: [...d.exercises, newEx] };
              }),
            };
          }),
        }));
      },

      updateSetInPlan: (planId, dayId, exerciseId, setIndex, field, value) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            return {
              ...p,
              days: p.days.map((d) => {
                if (d.id !== dayId) return d;
                return {
                  ...d,
                  exercises: d.exercises.map((e) => {
                    if (e.id !== exerciseId) return e;
                    const updatedSets = [...e.sets];
                    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
                    return { ...e, sets: updatedSets };
                  }),
                };
              }),
            };
          }),
        }));
      },

      setActivePlan: (planId) => {
        set((state) => ({
          plans: state.plans.map((p) => ({
            ...p,
            isActive: p.id === planId,
          })),
        }));
      },

      deletePlan: (planId) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
        }));
      },

      addCustomExercise: (name, category, equipment, primaryMuscle) => {
        const newEx: CustomExercise = {
          id: `ex-custom-${Date.now()}`,
          name,
          category,
          equipment,
          primaryMuscle,
        };
        set((state) => ({ customExercises: [newEx, ...state.customExercises] }));
      },

      // Gym Floor Logger Implementation
      startWorkoutSession: (planId, dayId) => {
        const plan = get().plans.find((p) => p.id === planId);
        const day = plan?.days.find((d) => d.id === dayId);
        if (!day) return;

        set({
          activeWorkout: {
            planId,
            dayId,
            dayName: day.name,
            startTime: Date.now(),
            exercises: JSON.parse(JSON.stringify(day.exercises)),
            activeRestTimer: null,
          },
        });
      },

      toggleSetCompletion: (exerciseIndex, setIndex, weight, reps) => {
        const active = get().activeWorkout;
        if (!active) return;

        const updatedExercises = [...active.exercises];
        const targetEx = updatedExercises[exerciseIndex];
        if (!targetEx) return;

        const targetSet = targetEx.sets[setIndex];
        const isNowCompleted = !targetSet.completed;

        targetEx.sets[setIndex] = {
          ...targetSet,
          weight,
          targetReps: reps,
          completed: isNowCompleted,
        };

        let newRestTimer = active.activeRestTimer;
        if (isNowCompleted) {
          const restTime = targetSet.restSeconds || 120;
          newRestTimer = {
            endTime: Date.now() + restTime * 1000,
            duration: restTime,
          };
        }

        set({
          activeWorkout: {
            ...active,
            exercises: updatedExercises,
            activeRestTimer: newRestTimer,
          },
        });
      },

      triggerRestTimer: (seconds) => {
        const active = get().activeWorkout;
        if (!active) return;
        set({
          activeWorkout: {
            ...active,
            activeRestTimer: {
              endTime: Date.now() + seconds * 1000,
              duration: seconds,
            },
          },
        });
      },

      cancelRestTimer: () => {
        const active = get().activeWorkout;
        if (!active) return;
        set({ activeWorkout: { ...active, activeRestTimer: null } });
      },

      finishWorkoutSession: () => {
        const active = get().activeWorkout;
        if (!active) return;

        let totalVolume = 0;
        let loggedSets = 0;

        active.exercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            if (s.completed) {
              totalVolume += s.weight * s.targetReps;
              loggedSets += 1;
            }
          });
        });

        const durationMin = active.startTime
          ? Math.max(1, Math.round((Date.now() - active.startTime) / 60000))
          : 45;

        const newSession: CompletedSession = {
          id: `hist-${Date.now()}`,
          planName: active.dayName,
          dayName: active.dayName,
          completedAt: new Date().toISOString(),
          totalVolumeKg: totalVolume,
          durationMinutes: durationMin,
          loggedSetsCount: loggedSets,
        };

        set((state) => ({
          completedSessions: [newSession, ...state.completedSessions],
          activeWorkout: null,
        }));
      },
    }),
    {
      name: "aperture-unified-app-storage",
    }
  )
);