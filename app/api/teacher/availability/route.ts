import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slots } = await req.json();

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { teacherProfile: true },
  });

  if (!user || user.role !== "TEACHER" || !user.teacherProfile) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  await db.availability.deleteMany({ where: { teacherProfileId: user.teacherProfile.id } });

  if (slots.length > 0) {
    await db.availability.createMany({
      data: slots.map((s: { dayOfWeek: number; startTime: string; endTime: string }) => ({
        teacherProfileId: user.teacherProfile!.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });
  }

  return NextResponse.json({ ok: true });
}
