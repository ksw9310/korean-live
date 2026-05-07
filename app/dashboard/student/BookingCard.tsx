"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Booking {
  id: string;
  status: string;
  scheduledAt: Date;
  teacher: { name: string };
  review: { rating: number } | null;
}

export function BookingCard({ booking: b }: { booking: Booking }) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState(b.status);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hoursUntil = (new Date(b.scheduledAt).getTime() - Date.now()) / 3_600_000;
  const isRefundable = hoursUntil > 24;

  async function handleCancel() {
    const msg = isRefundable
      ? "Cancel this session? Your credit will be refunded."
      : "Cancel this session? It's within 24 hours so no refund will be issued.";
    if (!confirm(msg)) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${b.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      setStatus("CANCELLED");
      toast.success(data.refunded ? "Booking cancelled — credit refunded." : "Booking cancelled.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setCancelling(false);
    }
  }

  async function handleReview() {
    if (!selectedStar) return toast.error("Please select a rating.");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${b.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedStar, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      toast.success("Review submitted!");
      setReviewOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  const displayStar = hoveredStar || selectedStar;

  return (
    <>
      <Card>
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{b.teacher.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(b.scheduledAt).toLocaleString("en-US")}
            </p>
            {b.review && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < b.review!.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                status === "COMPLETED"
                  ? "default"
                  : status === "CANCELLED"
                  ? "destructive"
                  : "secondary"
              }
            >
              {status.toLowerCase()}
            </Badge>
            {status === "CONFIRMED" && (
              <>
                <Button size="sm" asChild>
                  <Link href={`/room/${b.id}`}>Join</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling…" : "Cancel"}
                </Button>
              </>
            )}
            {status === "COMPLETED" && !b.review && (
              <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
                Leave a review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review your session with {b.teacher.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoveredStar(i + 1)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedStar(i + 1)}
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      i < displayStar
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            {selectedStar > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {["", "Poor", "Fair", "Good", "Very good", "Excellent"][selectedStar]}
              </p>
            )}
            <Textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={handleReview} disabled={submitting || !selectedStar}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
