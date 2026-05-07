import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { sendBookingConfirmed } from "@/lib/email";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teacherId, scheduledAt } = await req.json();
  if (!teacherId || !scheduledAt) {
    return NextResponse.json({ error: "teacherId and scheduledAt are required" }, { status: 400 });
  }

  const scheduledDate = new Date(scheduledAt);
  if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
    return NextResponse.json({ error: "Invalid or past date" }, { status: 400 });
  }

  const db = getDb();

  const [student, teacher] = await Promise.all([
    db.user.findUnique({
      where: { clerkId },
      include: { creditLedger: true },
    }),
    db.user.findUnique({
      where: { id: teacherId },
      include: { teacherProfile: true },
    }),
  ]);

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  if (!teacher?.teacherProfile) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  if (student.role !== "STUDENT") return NextResponse.json({ error: "Only students can book" }, { status: 403 });

  const balance = student.creditLedger.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  if (balance < 1) {
    return NextResponse.json({ error: "Insufficient credits. Please buy more credits." }, { status: 402 });
  }

  // Check for double-booking
  const conflict = await db.booking.findFirst({
    where: {
      teacherId,
      scheduledAt: scheduledDate,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (conflict) {
    return NextResponse.json({ error: "This time slot is already booked" }, { status: 409 });
  }

  const booking = await db.booking.create({
    data: {
      studentId: student.id,
      teacherId,
      scheduledAt: scheduledDate,
      status: "CONFIRMED",
      creditCost: 1,
      ledgerEntry: {
        create: {
          userId: student.id,
          amount: -1,
          type: "SPENT",
        },
      },
    },
  });

  after(async () => {
    try {
      await sendBookingConfirmed({
        studentEmail: student.email,
        teacherEmail: teacher.email,
        studentName: student.name,
        teacherName: teacher.name,
        scheduledAt: scheduledDate,
        bookingId: booking.id,
      });
    } catch (err) {
      console.error("Email send failed", err);
    }
  });

  return NextResponse.json({ bookingId: booking.id });
}
