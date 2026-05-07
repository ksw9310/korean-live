import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { sendBookingCancelled } from "@/lib/email";

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

  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = booking.studentId === user.id || booking.teacherId === user.id;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Only confirmed bookings can be cancelled" }, { status: 400 });
  }

  // Teacher cancellations always get a full refund
  // Student cancellations are refundable only if > 24 hours before session
  const isTeacher = booking.teacherId === user.id;
  const hoursUntilSession = (booking.scheduledAt.getTime() - Date.now()) / 3_600_000;
  const isRefundable = isTeacher || hoursUntilSession > 24;

  await db.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (isRefundable) {
      await tx.creditLedger.create({
        data: {
          userId: booking.studentId,
          amount: booking.creditCost,
          type: "REFUND",
          bookingId: booking.id,
        },
      });
    }
  });

  after(async () => {
    try {
      const [student, teacher] = await Promise.all([
        db.user.findUnique({ where: { id: booking.studentId } }),
        db.user.findUnique({ where: { id: booking.teacherId } }),
      ]);
      if (student && teacher) {
        await sendBookingCancelled({
          studentEmail: student.email,
          teacherEmail: teacher.email,
          studentName: student.name,
          teacherName: teacher.name,
          scheduledAt: booking.scheduledAt,
          refunded: isRefundable,
        });
      }
    } catch (err) {
      console.error("Cancel email send failed", err);
    }
  });

  return NextResponse.json({ ok: true, refunded: isRefundable });
}
