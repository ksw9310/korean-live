"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAY_NAMES } from "@/lib/constants";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface Slot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export function AvailabilityForm({ initialSlots }: { initialSlots: Slot[] }) {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [loading, setLoading] = useState(false);

  function addSlot(day: number) {
    setSlots((prev) => [...prev, { dayOfWeek: day, startTime: "09:00", endTime: "18:00" }]);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: "startTime" | "endTime", value: string) {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  async function handleSave() {
    for (const s of slots) {
      if (s.startTime >= s.endTime) {
        toast.error(`End time must be after start time (${DAY_NAMES[s.dayOfWeek]})`);
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) throw new Error();
      toast.success("Availability saved!");
      router.push("/dashboard/teacher");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const slotsByDay = DAY_NAMES.map((_, day) => ({
    day,
    slots: slots.map((s, i) => ({ ...s, index: i })).filter((s) => s.dayOfWeek === day),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weekly Availability</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set your recurring weekly schedule. Students can book any available slot.
        </p>
      </div>

      <div className="space-y-4">
        {slotsByDay.map(({ day, slots: daySlots }) => (
          <Card key={day}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{DAY_NAMES[day]}</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => addSlot(day)}>
                  <Plus className="h-4 w-4 mr-1" /> Add slot
                </Button>
              </div>
            </CardHeader>
            {daySlots.length > 0 && (
              <CardContent className="space-y-2 pt-0">
                {daySlots.map((slot) => (
                  <div key={slot.index} className="flex items-center gap-2">
                    <select
                      className="border rounded-md px-2 py-1 text-sm bg-background"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.index, "startTime", e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-muted-foreground text-sm">–</span>
                    <select
                      className="border rounded-md px-2 py-1 text-sm bg-background"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.index, "endTime", e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                      onClick={() => removeSlot(slot.index)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save availability"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/teacher")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
