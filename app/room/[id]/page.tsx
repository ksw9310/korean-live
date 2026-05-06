export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { VideoRoom } from "./VideoRoom";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: bookingId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/onboarding");

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { student: true, teacher: true },
  });

  if (!booking) notFound();

  const isParticipant = booking.studentId === user.id || booking.teacherId === user.id;
  if (!isParticipant) redirect("/dashboard/student");

  return (
    <div className="h-screen flex flex-col bg-black">
      <VideoRoom
        bookingId={bookingId}
        userName={user.name}
        isTeacher={booking.teacherId === user.id}
        scheduledAt={booking.scheduledAt.toISOString()}
        durationMins={booking.durationMins}
      />
    </div>
  );
}
