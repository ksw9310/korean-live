import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  // Find all CONFIRMED bookings where scheduledAt + durationMins has passed
  const due = await db.booking.findMany({
    where: { status: "CONFIRMED" },
    include: { teacher: { include: { teacherProfile: true } } },
  });

  const toComplete = due.filter((b) => {
    const endsAt = new Date(b.scheduledAt);
    endsAt.setMinutes(endsAt.getMinutes() + b.durationMins);
    return endsAt < now;
  });

  if (toComplete.length === 0) {
    return NextResponse.json({ completed: 0 });
  }

  await Promise.all(
    toComplete.map(async (booking) => {
      await db.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        });

        const profile = booking.teacher.teacherProfile;
        if (!profile) return;

        const teacherAmount = profile.pricePerCredit * (1 - PLATFORM_FEE_PERCENT / 100);

        await tx.payout.create({
          data: {
            teacherId: booking.teacherId,
            amount: teacherAmount,
            status: "PENDING",
          },
        });
      });
    })
  );

  console.log(`Auto-completed ${toComplete.length} sessions`);
  return NextResponse.json({ completed: toComplete.length });
}
