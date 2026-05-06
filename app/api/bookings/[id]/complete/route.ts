import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookingId } = await params;
  const db = getDb();

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      teacher: { include: { teacherProfile: true } },
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.teacherId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Already completed" }, { status: 400 });

  // Must be at least 80% through the scheduled duration before completing
  const minCompletionTime = new Date(booking.scheduledAt);
  minCompletionTime.setMinutes(minCompletionTime.getMinutes() + Math.floor(booking.durationMins * 0.8));
  if (new Date() < minCompletionTime) {
    return NextResponse.json(
      { error: "Session cannot be completed yet. Please wait until at least 80% of the session time has passed." },
      { status: 400 }
    );
  }

  await db.booking.update({ where: { id: bookingId }, data: { status: "COMPLETED" } });

  const teacherProfile = booking.teacher.teacherProfile!;
  const grossAmount = teacherProfile.pricePerCredit;
  const teacherAmount = grossAmount * (1 - PLATFORM_FEE_PERCENT / 100);

  after(async () => {
    try {
      if (
        teacherProfile.stripeAccountId &&
        teacherProfile.stripeOnboarded
      ) {
        const transfer = await getStripe().transfers.create({
          amount: Math.round(teacherAmount * 100),
          currency: "usd",
          destination: teacherProfile.stripeAccountId,
          description: `Payout for booking ${bookingId}`,
        });

        await db.payout.create({
          data: {
            teacherId: booking.teacherId,
            amount: teacherAmount,
            stripeTransferId: transfer.id,
            status: "COMPLETED",
          },
        });
      } else {
        await db.payout.create({
          data: {
            teacherId: booking.teacherId,
            amount: teacherAmount,
            status: "PENDING",
          },
        });
      }
    } catch (err) {
      console.error("Payout failed for booking", bookingId, err);
    }
  });

  return NextResponse.json({ ok: true });
}
