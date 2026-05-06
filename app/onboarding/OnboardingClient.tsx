"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function OnboardingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function selectRole(role: "STUDENT" | "TEACHER") {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      if (role === "TEACHER") {
        router.push("/dashboard/teacher/profile/setup");
      } else {
        router.push("/dashboard/student/profile/setup");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to KoreanLive</h1>
          <p className="text-muted-foreground">How will you use the platform?</p>
        </div>
        <div className="grid gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => !loading && selectRole("STUDENT")}
          >
            <CardHeader>
              <CardTitle>I want to learn Korean</CardTitle>
              <CardDescription>
                Browse tutors, book sessions, and practice with a native speaker via live video.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => !loading && selectRole("TEACHER")}
          >
            <CardHeader>
              <CardTitle>I want to teach Korean</CardTitle>
              <CardDescription>
                Set your schedule, pricing, and start earning by teaching students worldwide.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you confirm you are 18 years of age or older and agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.
        </p>
      </div>
    </div>
  );
}
