import { describe, it, expect } from "vitest";
import { calculateE1RM, calculateTotalVolume } from "../metrics";

describe("Epley 1RM Calculator", () => {
  it("returns exact weight for a single rep max", () => {
    expect(calculateE1RM(100, 1)).toBe(100);
  });

  it("calculates correct 1RM for 100kg x 10 reps", () => {
    // 100 * (1 + 10/30) = 133.33 -> 133.3
    expect(calculateE1RM(100, 10)).toBe(133.3);
  });

  it("handles zero or negative inputs gracefully", () => {
    expect(calculateE1RM(0, 5)).toBe(0);
    expect(calculateE1RM(100, 0)).toBe(0);
  });
});

describe("Total Volume Calculator", () => {
  it("sums volume only for completed sets", () => {
    const sets = [
      { weight: 80, reps: 8, completed: true },  // 640
      { weight: 85, reps: 6, completed: true },  // 510
      { weight: 85, reps: 6, completed: false }, // Ignored
    ];
    expect(calculateTotalVolume(sets)).toBe(1150);
  });
});