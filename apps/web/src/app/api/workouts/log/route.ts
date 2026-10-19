export async function POST() {
  return Response.json(
    { detail: "Use the FastAPI workout logger endpoints to record a session." },
    { status: 410 },
  );
}
