export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LEVEL_LABELS, LEVEL_INFO, DAY_NAMES } from "@/lib/constants";
import { BookingWidget } from "./BookingWidget";

async function getTeacher(id: string) {
  const db = getDb();
  return db.user.findUnique({
    where: { id, role: "TEACHER" },
    include: {
      teacherProfile: { include: { availabilities: true } },
      reviewsReceived: {
        include: { student: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getTeacher(id);
  if (!teacher?.teacherProfile) notFound();

  const { userId: clerkId } = await auth();
  const profile = teacher.teacherProfile;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex gap-6 items-start">
        <Avatar className="h-20 w-20 shrink-0">
          <AvatarImage src={teacher.avatarUrl ?? ""} />
          <AvatarFallback className="text-2xl">{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{teacher.name}</h1>
            {profile.isVerified && <Badge variant="outline">Verified</Badge>}
          </div>
          <p className="text-muted-foreground mt-1">{profile.languages.join(" · ")}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            {profile.totalReviews > 0 && (
              <span>★ {profile.rating.toFixed(1)} ({profile.totalReviews} reviews)</span>
            )}
            <span className="font-semibold">${profile.pricePerCredit}/session</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left — details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{profile.bio}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Levels taught</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {profile.levelsTaught.map((lvl) => {
                const info = LEVEL_INFO[lvl];
                if (!info) return <Badge key={lvl} variant="secondary">{LEVEL_LABELS[lvl]}</Badge>;
                return (
                  <div key={lvl} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{info.label}</span>
                      <span className="text-xs text-muted-foreground">{info.topik}</span>
                      <span className="ml-auto text-xs font-medium text-violet-400">
                        {info.creditCost} credit{info.creditCost > 1 ? "s" : ""}/session
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {info.bullets.map((b) => (
                        <li key={b} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Weekly availability</CardTitle></CardHeader>
            <CardContent>
              {profile.availabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability set yet.</p>
              ) : (
                <div className="space-y-2">
                  {profile.availabilities.map((a) => (
                    <div key={a.id} className="flex gap-3 text-sm">
                      <span className="w-10 font-medium">{DAY_NAMES[a.dayOfWeek]}</span>
                      <span className="text-muted-foreground">{a.startTime} – {a.endTime} UTC</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {teacher.reviewsReceived.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Reviews</h2>
              {teacher.reviewsReceived.map((r) => (
                <Card key={r.id}>
                  <CardContent className="pt-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{r.student.name}</span>
                      <span className="text-sm">{"★".repeat(r.rating)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right — booking widget */}
        <div className="md:col-span-1">
          <BookingWidget
            teacherId={teacher.id}
            teacherName={teacher.name}
            pricePerCredit={profile.pricePerCredit}
            creditCost={profile.creditCost}
            availabilities={profile.availabilities}
            isLoggedIn={!!clerkId}
          />
        </div>
      </div>
      <Separator />
    </div>
  );
}
