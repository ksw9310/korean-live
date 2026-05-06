"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEVEL_LABELS, LEVEL_TOPIK } from "@/lib/constants";
import { toast } from "sonner";

export default function StudentProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("");
  const [goals, setGoals] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!level) { toast.error("Please select your level"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLevel: level, learningGoals: goals }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard/student");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Your current Korean level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level…" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label} — {LEVEL_TOPIK[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Learning goals (optional)</Label>
              <Textarea
                placeholder="e.g. I want to watch K-dramas without subtitles…"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
