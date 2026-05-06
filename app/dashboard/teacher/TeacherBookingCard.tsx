"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Booking {
  id: string;
  status: string;
  scheduledAt: Date;
  student: { name: string };
}

export function TeacherBookingCard({ booking: b }: { booking: Booking }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!confirm("Cancel this session? The student will receive a full credit refund.")) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${b.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      toast.success("Session cancelled — student has been refunded.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{b.student.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(b.scheduledAt).toLocaleString("en-US")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={
              b.status === "COMPLETED"
                ? "default"
                : b.status === "CANCELLED"
                ? "destructive"
                : "secondary"
            }
          >
            {b.status.toLowerCase()}
          </Badge>
          {b.status === "CONFIRMED" && (
            <>
              <Button size="sm" asChild>
                <Link href={`/room/${b.id}`}>Join</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
