// Payments are now handled client-side via Paddle.js overlay.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use Paddle checkout instead" },
    { status: 410 }
  );
}
