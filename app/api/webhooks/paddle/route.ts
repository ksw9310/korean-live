import { NextResponse } from "next/server";
import { getPaddle } from "@/lib/paddle";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  let event;
  try {
    event = await getPaddle().webhooks.unmarshal(rawBody, webhookSecret, signature);
  } catch (err) {
    console.error("Paddle webhook verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.eventType === "transaction.completed") {
    const transaction = event.data as any;
    const customData = transaction.customData as { clerkId?: string; credits?: string } | null;

    if (!customData?.clerkId || !customData?.credits) {
      console.error("Paddle webhook: missing customData", customData);
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    const user = await db.user.findUnique({ where: { clerkId: customData.clerkId } });
    if (!user) {
      console.error("Paddle webhook: user not found", customData.clerkId);
      return NextResponse.json({ ok: true });
    }

    await db.creditLedger.create({
      data: {
        userId: user.id,
        amount: parseInt(customData.credits, 10),
        type: "PURCHASE",
        stripeSessionId: transaction.id, // Paddle transaction ID stored here
      },
    });

    console.log(`Credits added: ${customData.credits} for user ${user.id}`);
  }

  return NextResponse.json({ ok: true });
}
