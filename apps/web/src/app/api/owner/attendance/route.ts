export async function POST() {
  return Response.json(
    { detail: "Attendance updates are not available through this route." },
    { status: 410 },
  );
}
