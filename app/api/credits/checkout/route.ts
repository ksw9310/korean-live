import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createLSCheckout } from "@/lib/lemonsqueezy";
import { CREDIT_PACKS } from "@/lib/constants";

const VARIANT_IDS: Record<string, string | undefined> = {
  "5credits": process.env.LEMONSQUEEZY_VARIANT_5_CREDITS,
  "10credits": process.env.LEMONSQUEEZY_VARIANT_10_CREDITS,
  "20credits": process.env.LEMONSQUEEZY_VARIANT_20_CREDITS,
};

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { packId } = await req.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const variantId = VARIANT_IDS[packId];
  if (!variantId) return NextResponse.json({ error: "Variant not configured" }, { status: 503 });

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) return NextResponse.json({ error: "Store not configured" }, { status: 503 });

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const origin = req.headers.get("origin") ?? "https://koreanlive.live";

  try {
    const url = await createLSCheckout({
      storeId,
      variantId,
      userId: user.id,
      credits: pack.credits,
      redirectUrl: `${origin}/dashboard/student/credits?success=1`,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
