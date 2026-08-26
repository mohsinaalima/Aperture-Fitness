import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainerId, clientId, planId } = body;

    if (!clientId || !planId) {
      return NextResponse.json(
        { error: "Both clientId and planId are required." },
        { status: 400 }
      );
    }

    const assignment = {
      id: `assign-${Date.now()}`,
      trainerId: trainerId || "tr-01",
      clientId,
      planId,
      assignedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    return NextResponse.json(
      {
        message: "Plan successfully assigned to client.",
        assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign plan to client." },
      { status: 500 }
    );
  }
}