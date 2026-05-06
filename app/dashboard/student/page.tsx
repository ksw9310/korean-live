export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookingCard } from "./BookingCard";

async function getStudentData(clerkId: string) {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: {
      studentProfile: true,
      creditLedger: { orderBy: { createdAt: "desc" } },
      bookingsAsStudent: {
        include: { teacher: true, review: true },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
    },
  });
  return user;
}

function creditBalance(ledger: { amount: number }[]) {
  return ledger.reduce((sum, e) => sum + e.amount, 0);
}

export default async function StudentDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await getStudentData(clerkId);
  if (!user) redirect("/onboarding");
  if (user.role !== "STUDENT") redirect("/dashboard/teacher");
  if (!user.studentProfile) redirect("/dashboard/student/profile/setup");

  const balance = creditBalance(user.creditLedger);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
        <Button asChild>
          <Link href="/teachers">Find a tutor</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{balance}</p>
            <p className="text-sm text-muted-foreground mt-1">sessions available</p>
            <Button className="mt-4 w-full" variant="outline" asChild>
              <Link href="/dashboard/student/credits">Buy more credits</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {user.studentProfile.currentLevel.replace(/_/g, " ")}
            </p>
            {user.studentProfile.learningGoals && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.studentProfile.learningGoals}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent bookings</h2>
        {user.bookingsAsStudent.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No bookings yet.{" "}
              <Link href="/teachers" className="underline text-foreground">
                Book your first session →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.bookingsAsStudent.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
      <Separator />
      <div className="text-sm text-muted-foreground flex gap-4">
        <Link href="/dashboard/student/profile/setup" className="hover:text-foreground">Edit profile</Link>
      </div>
    </div>
  );
}
