import type { RoutinePlan } from "@/store/app-store";

type ApiPlan = {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  lastEdited?: string | null;
  days: Array<{
    id: string;
    name: string;
    targetDay: string;
    exercises: Array<{
      id: string;
      name: string;
      category: string;
      sets: Array<{ id: string; targetReps: number; weight: number; restSeconds: number }>;
    }>;
  }>;
};

export function mapApiPlans(plans: ApiPlan[]): RoutinePlan[] {
  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description ?? "",
    isCustom: true,
    isActive: plan.isActive,
    createdAt: plan.lastEdited ? new Date(plan.lastEdited).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    days: plan.days.map((day) => ({
      id: day.id,
      name: day.name,
      targetDay: day.targetDay,
      exercises: day.exercises.map((exercise) => ({
        id: exercise.id,
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets.map((set) => ({ ...set, completed: false })),
      })),
    })),
  }));
}

export type { ApiPlan };
