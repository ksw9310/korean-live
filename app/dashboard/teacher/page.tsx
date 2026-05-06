export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeacherBookingCard } from "./TeacherBookingCard";

async function getTeacherData(clerkId: string) {
  const db = getDb();
  return db.user.findUnique({
    where: { clerkId },
    include: {
      teacherProfile: { include: { availabilities: true } },
      bookingsAsTeacher: {
        include: { student: true },
        orderBy: { scheduledAt: "desc" },
        take: 10,
      },
      payouts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
}

export default async function TeacherDashboard() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await getTeacherData(clerkId);
  if (!user) redirect("/onboarding");
  if (user.role !== "TEACHER") redirect("/dashboard/student");
  if (!user.teacherProfile) redirect("/dashboard/teacher/profile/setup");

  const upcoming = user.bookingsAsTeacher.filter((b) => b.status === "CONFIRMED");
  const completed = user.bookingsAsTeacher.filter((b) => b.status === "COMPLETED");
  const totalEarned = user.payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/teacher/availability">Set availability</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/teacher/profile/setup">Edit profile</Link>
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{upcoming.length}</p>
            <p className="text-sm text-muted-foreground mt-1">confirmed sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{completed.length}</p>
            <p className="text-sm text-muted-foreground mt-1">total sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${totalEarned.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground mt-1">total (after fees)</p>
            {!user.teacherProfile.stripeOnboarded && (
              <Button className="mt-3 w-full text-xs" size="sm" variant="outline" asChild>
                <Link href="/api/connect/onboard">Set up payouts →</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent bookings</h2>
        {user.bookingsAsTeacher.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No bookings yet. Make sure your availability is set so students can find you.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.bookingsAsTeacher.map((b) => (
              <TeacherBookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      <Separator />
      <div className="text-sm text-muted-foreground">
        Rating: {user.teacherProfile.rating.toFixed(1)} ★ ({user.teacherProfile.totalReviews} reviews)
      </div>
    </div>
  );
}
