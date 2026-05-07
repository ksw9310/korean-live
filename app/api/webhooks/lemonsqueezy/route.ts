import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-signature");

  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const digest = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(body);
  const eventName: string = payload.meta?.event_name;

  if (eventName === "order_created" && payload.data?.attributes?.status === "paid") {
    const custom = payload.meta?.custom_data as { userId?: string; credits?: string } | null;
    if (!custom?.userId || !custom?.credits) return NextResponse.json({ ok: true });

    const db = getDb();
    await db.creditLedger.create({
      data: {
        userId: custom.userId,
        amount: parseInt(custom.credits, 10),
        type: "PURCHASE",
        stripeSessionId: String(payload.data.id),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
