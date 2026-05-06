import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { CREDIT_PACKS } from "@/lib/constants";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const priceId = process.env[pack.priceEnvKey];
  if (!priceId) {
    return NextResponse.json({ error: "Payment not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "en",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/credits?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/credits`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      credits: String(pack.credits),
    },
  });

  return NextResponse.json({ url: session.url });
}
