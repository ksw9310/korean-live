"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Paddle } from "@paddle/paddle-js";

interface Props {
  packId: string;
  label: string;
  credits: number;
  paddlePriceId: string | undefined;
}

export function CreditPurchaseButton({ packId, label, credits, paddlePriceId }: Props) {
  const { user } = useUser();
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!clientToken) return;

    import("@paddle/paddle-js").then(({ initializePaddle }) => {
      initializePaddle({
        environment: "production",
        token: clientToken,
        eventCallback(event) {
          if (event.name === "checkout.completed") {
            toast.success("Payment successful! Credits will appear shortly.");
            setTimeout(() => window.location.reload(), 2000);
          }
          if (event.name === "checkout.closed") {
            setLoading(false);
          }
        },
      }).then((p) => p && setPaddle(p));
    });
  }, []);

  async function handleClick() {
    if (!paddlePriceId) {
      toast.error("Payment not configured yet. Please try again later.");
      return;
    }
    if (!user) {
      toast.error("Please sign in to purchase credits.");
      return;
    }
    if (!paddle) {
      toast.error("Payment system loading. Please try again.");
      return;
    }

    setLoading(true);
    paddle.Checkout.open({
      items: [{ priceId: paddlePriceId, quantity: 1 }],
      customData: {
        clerkId: user.id,
        credits: String(credits),
      },
    });
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading || !paddle}>
      {!paddle ? "Loading…" : loading ? "Opening checkout…" : label}
    </Button>
  );
}
