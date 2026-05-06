import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, pricePerCredit, levelsTaught, languages } = await req.json();
  if (!bio || !levelsTaught?.length || !languages?.length || !pricePerCredit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (pricePerCredit < 5 || pricePerCredit > 100) {
    return NextResponse.json({ error: "Price must be between $5 and $100" }, { status: 400 });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.teacherProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, bio, pricePerCredit, levelsTaught, languages },
    update: { bio, pricePerCredit, levelsTaught, languages },
  });

  return NextResponse.json({ ok: true });
}
