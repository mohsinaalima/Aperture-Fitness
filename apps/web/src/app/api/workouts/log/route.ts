import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, planName, loggedSets, duration } = body;

    if (!userId || !loggedSets || !Array.isArray(loggedSets)) {
      return NextResponse.json(
        { error: "Missing required fields: userId and loggedSets array are required." },
        { status: 400 }
      );
    }

    // Mock Database Persistence Response
    const sessionRecord = {
      id: `sess-${Date.now()}`,
      userId,
      planName: planName || "Unscheduled Workout",
      duration: duration || 45,
      completedAt: new Date().toISOString(),
      setsCount: loggedSets.length,
      status: "SUCCESS",
    };

    return NextResponse.json(
      {
        message: "Workout session successfully recorded.",
        session: sessionRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error while logging workout session." },
      { status: 500 }
    );
  }
}