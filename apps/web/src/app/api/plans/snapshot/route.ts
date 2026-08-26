import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, name, version, days } = body;

    if (!name || !days) {
      return NextResponse.json(
        { error: "Plan name and day structure are required." },
        { status: 400 }
      );
    }

    const snapshot = {
      id: `snap-${Date.now()}`,
      planId: planId || `plan-${Date.now()}`,
      name,
      version: version || "1.0",
      totalExercises: days.reduce(
        (acc: number, d: { exercises?: unknown[] }) => acc + (d.exercises?.length || 0),
        0
      ),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: "Workout spec snapshot created successfully.",
        snapshot,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to persist plan snapshot." },
      { status: 500 }
    );
  }
}