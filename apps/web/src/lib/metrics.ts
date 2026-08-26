/**
 * Calculates estimated 1RM using the Epley Formula: w * (1 + r / 30)
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const e1rm = weight * (1 + reps / 30);
  return Number(e1rm.toFixed(1));
}

/**
 * Calculates total volume for a list of set logs
 */
export function calculateTotalVolume(sets: Array<{ weight: number; reps: number; completed: boolean }>): number {
  return sets
    .filter((s) => s.completed)
    .reduce((total, s) => total + s.weight * s.reps, 0);
}