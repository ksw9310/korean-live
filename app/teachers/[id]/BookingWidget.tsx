"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DAY_NAMES } from "@/lib/constants";

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Props {
  teacherId: string;
  teacherName: string;
  pricePerCredit: number;
  creditCost: number;
  availabilities: Availability[];
  isLoggedIn: boolean;
}

function getNextOccurrences(availabilities: Availability[]): Date[] {
  const now = new Date();
  const slots: Date[] = [];

  for (const a of availabilities) {
    for (let offset = 0; offset < 14; offset++) {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      if (d.getDay() !== a.dayOfWeek) continue;
      const [h, m] = a.startTime.split(":").map(Number);
      d.setUTCHours(h, m, 0, 0);
      if (d > now) slots.push(new Date(d));
      if (slots.length >= 6) break;
    }
    if (slots.length >= 6) break;
  }

  return slots.sort((a, b) => a.getTime() - b.getTime()).slice(0, 6);
}

export function BookingWidget({ teacherId, teacherName, pricePerCredit, creditCost, availabilities, isLoggedIn }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const slots = getNextOccurrences(availabilities);

  async function handleBook() {
    if (!isLoggedIn) { router.push("/sign-in"); return; }
    if (!selected) { toast.error("Pick a time slot"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, scheduledAt: selected.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      toast.success("Session booked!");
      router.push("/dashboard/student");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-base">Book a session</CardTitle>
        <p className="text-sm text-muted-foreground">
          {creditCost} credit{creditCost !== 1 ? "s" : ""} · 50 minutes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {teacherName.split(" ")[0]} hasn&apos;t set availability yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Available slots (your local time)
            </p>
            {slots.map((slot) => (
              <button
                key={slot.toISOString()}
                onClick={() => setSelected(slot)}
                className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                  selected?.toISOString() === slot.toISOString()
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <span className="font-medium">{DAY_NAMES[slot.getDay()]}</span>{" "}
                {slot.toLocaleDateString("en-US")} · {slot.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleBook}
          disabled={loading || slots.length === 0}
        >
          {loading ? "Booking…" : isLoggedIn ? `Book (${creditCost} credit${creditCost !== 1 ? "s" : ""})` : "Sign in to book"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Credits are deducted when you book. Cancel 24h before for a refund.
        </p>
      </CardContent>
    </Card>
  );
}
