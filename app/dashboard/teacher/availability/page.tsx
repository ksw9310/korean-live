export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { AvailabilityForm } from "./AvailabilityForm";

export default async function AvailabilityPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { teacherProfile: { include: { availabilities: true } } },
  });

  if (!user || user.role !== "TEACHER") redirect("/dashboard/student");
  if (!user.teacherProfile) redirect("/dashboard/teacher/profile/setup");

  return (
    <AvailabilityForm
      initialSlots={user.teacherProfile.availabilities.map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }))}
    />
  );
}
