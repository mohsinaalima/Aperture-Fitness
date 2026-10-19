export async function POST() {
  return Response.json(
    { detail: "Plan snapshots are not available through this route. Use the workout plans API." },
    { status: 410 },
  );
}
