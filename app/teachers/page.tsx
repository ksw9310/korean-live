export const dynamic = "force-dynamic";

import { getDb } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LEVEL_LABELS } from "@/lib/constants";

async function getTeachers() {
  const db = getDb();
  return db.user.findMany({
    where: { role: "TEACHER", teacherProfile: { isNot: null } },
    include: { teacherProfile: { include: { availabilities: true } } },
    orderBy: { teacherProfile: { rating: "desc" } },
  });
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Find a Korean tutor</h1>
        <p className="text-muted-foreground mt-1">
          {teachers.length} tutors available · 1 credit = 50-min session
        </p>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No tutors yet. Check back soon!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teachers.map((teacher) => {
            const profile = teacher.teacherProfile!;
            return (
              <Link key={teacher.id} href={`/teachers/${teacher.id}`}>
                <Card className="hover:border-primary transition-colors h-full">
                  <CardContent className="pt-6 flex gap-4">
                    <Avatar className="h-14 w-14 shrink-0">
                      <AvatarImage src={teacher.avatarUrl ?? ""} />
                      <AvatarFallback>{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">{teacher.name}</p>
                        <span className="text-sm font-medium shrink-0">
                          ${profile.pricePerCredit}/session
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {profile.bio}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {profile.levelsTaught.map((lvl) => (
                          <Badge key={lvl} variant="secondary" className="text-xs">
                            {LEVEL_LABELS[lvl]}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {profile.totalReviews > 0 && (
                          <span>★ {profile.rating.toFixed(1)} ({profile.totalReviews})</span>
                        )}
                        <span>{profile.languages.join(", ")}</span>
                        {profile.isVerified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
