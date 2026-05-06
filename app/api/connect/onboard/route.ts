import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const stripe = getStripe();
  const { userId: clerkId } = await auth();
  if (!clerkId) return new Response("Unauthorized", { status: 401 });

  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { teacherProfile: true },
  });

  if (!user?.teacherProfile) return new Response("Teacher profile not found", { status: 404 });

  let stripeAccountId = user.teacherProfile.stripeAccountId;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: { transfers: { requested: true } },
    });
    stripeAccountId = account.id;
    await db.teacherProfile.update({
      where: { userId: user.id },
      data: { stripeAccountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/onboard`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/return`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}
