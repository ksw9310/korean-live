"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  packId: string;
  label: string;
}

export function CreditPurchaseButton({ packId, label }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={handleClick} disabled={loading}>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
