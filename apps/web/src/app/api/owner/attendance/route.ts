import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trainerId, gymId, present } = body;

    if (!trainerId) {
      return NextResponse.json(
        { error: "Trainer ID is required for attendance logging." },
        { status: 400 }
      );
    }

    const attendanceEntry = {
      id: `att-${Date.now()}`,
      trainerId,
      gymId: gymId || "gym-central",
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      present: present !== undefined ? present : true,
    };

    return NextResponse.json(
      {
        message: "Attendance status updated.",
        attendance: attendanceEntry,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record trainer attendance." },
      { status: 500 }
    );
  }
}