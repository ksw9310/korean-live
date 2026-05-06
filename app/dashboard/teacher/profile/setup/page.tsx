export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { TeacherProfileForm } from "./TeacherProfileForm";

export default async function TeacherProfileSetupPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { teacherProfile: true },
  });
  if (!user) redirect("/onboarding");

  return (
    <TeacherProfileForm
      initialBio={user.teacherProfile?.bio ?? ""}
      initialPrice={user.teacherProfile?.pricePerCredit ?? 15}
      initialLevels={user.teacherProfile?.levelsTaught ?? []}
      initialLanguages={user.teacherProfile?.languages ?? []}
      initialAvatarUrl={user.avatarUrl ?? ""}
    />
  );
}
