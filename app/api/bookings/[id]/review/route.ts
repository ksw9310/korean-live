import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookingId } = await params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.studentId !== user.id) return NextResponse.json({ error: "Only students can review" }, { status: 403 });
  if (booking.status !== "COMPLETED") return NextResponse.json({ error: "Can only review completed sessions" }, { status: 400 });
  if (booking.review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  // Create review and update teacher rating atomically
  await db.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        bookingId,
        studentId: user.id,
        teacherId: booking.teacherId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    // Recalculate teacher's average rating
    const reviews = await tx.review.findMany({
      where: { teacherId: booking.teacherId },
      select: { rating: true },
    });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await tx.teacherProfile.update({
      where: { userId: booking.teacherId },
      data: {
        rating: Math.round(avg * 10) / 10,
        totalReviews: reviews.length,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
