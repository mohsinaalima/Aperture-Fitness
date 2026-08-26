"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

// IndexedDB Storage Adapter for Zustand
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export interface SetLog {
  id: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseSession {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

interface WorkoutState {
  activeSessionId: string | null;
  exercises: ExerciseSession[];
  currentExerciseIndex: number;
  isOffline: boolean;
  syncQueue: Array<{ action: string; payload: unknown; timestamp: number }>;
  
  // Actions
  startSession: (sessionId: string, exercises: ExerciseSession[]) => void;
  updateSet: (exerciseIndex: number, setIndex: number, weight: number, reps: number, completed: boolean) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setOfflineStatus: (status: boolean) => void;
  clearSyncQueue: () => void;
  endSession: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeSessionId: null,
      exercises: [],
      currentExerciseIndex: 0,
      isOffline: false,
      syncQueue: [],

      startSession: (sessionId, exercises) => {
        set({ activeSessionId: sessionId, exercises, currentExerciseIndex: 0 });
      },

      updateSet: (exerciseIndex, setIndex, weight, reps, completed) => {
        const exercises = [...get().exercises];
        const targetExercise = exercises[exerciseIndex];
        if (!targetExercise) return;

        const updatedSets = [...targetExercise.sets];
        updatedSets[setIndex] = { ...updatedSets[setIndex], weight, reps, completed };
        exercises[exerciseIndex] = { ...targetExercise, sets: updatedSets };

        // Append action to offline sync queue
        const syncQueue = [
          ...get().syncQueue,
          {
            action: "UPDATE_SET",
            payload: { exerciseIndex, setIndex, weight, reps, completed },
            timestamp: Date.now(),
          },
        ];

        set({ exercises, syncQueue });
      },

      addSetToExercise: (exerciseIndex) => {
        const exercises = [...get().exercises];
        const targetExercise = exercises[exerciseIndex];
        if (!targetExercise) return;

        const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
        const newSet: SetLog = {
          id: targetExercise.sets.length + 1,
          weight: lastSet ? lastSet.weight : 80,
          reps: lastSet ? lastSet.reps : 8,
          completed: false,
        };

        exercises[exerciseIndex] = {
          ...targetExercise,
          sets: [...targetExercise.sets, newSet],
        };

        set({ exercises });
      },

      setCurrentExerciseIndex: (index) => {
        set({ currentExerciseIndex: index });
      },

      setOfflineStatus: (status) => {
        set({ isOffline: status });
      },

      clearSyncQueue: () => {
        set({ syncQueue: [] });
      },

      endSession: () => {
        set({ activeSessionId: null, exercises: [], currentExerciseIndex: 0, syncQueue: [] });
      },
    }),
    {
      name: "aperture-workout-persistence",
      storage: createJSONStorage(() => indexedDBStorage),
    }
  )
);