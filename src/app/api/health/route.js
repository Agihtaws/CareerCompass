import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// Always run fresh — never cache a health check.
export const dynamic = "force-dynamic";

/**
 * Visit /api/health in your browser after `npm run dev`.
 * It confirms the server is up and whether the database connects.
 */
export async function GET() {
  const checks = { app: "ok", database: "unknown" };

  try {
    await connectToDatabase();
    checks.database = "connected";
  } catch (error) {
    checks.database = "not connected";
    return NextResponse.json(
      {
        status: "degraded",
        checks,
        hint: "Add a valid MONGODB_URI to .env.local, then restart the dev server.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ status: "ok", checks });
}