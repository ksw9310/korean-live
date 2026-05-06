import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new Response("Unauthorized", { status: 401 });

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile?.stripeAccountId) redirect("/dashboard/teacher");

  const account = await getStripe().accounts.retrieve(user.teacherProfile.stripeAccountId);
  const isOnboarded = account.details_submitted && account.charges_enabled;

  if (isOnboarded) {
    await db.teacherProfile.update({
      where: { userId: user.id },
      data: { stripeOnboarded: true },
    });
  }

  redirect("/dashboard/teacher");
}
