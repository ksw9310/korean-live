import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { studentProfile: true, teacherProfile: true },
  });

  if (user?.role === "STUDENT" && user.studentProfile) {
    redirect("/dashboard/student");
  }
  if (user?.role === "TEACHER" && user.teacherProfile) {
    redirect("/dashboard/teacher");
  }
  if (user?.role === "STUDENT" && !user.studentProfile) {
    redirect("/dashboard/student/profile/setup");
  }
  if (user?.role === "TEACHER" && !user.teacherProfile) {
    redirect("/dashboard/teacher/profile/setup");
  }

  return <OnboardingClient />;
}
