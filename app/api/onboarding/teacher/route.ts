import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio, pricePerCredit, creditCost, levelsTaught, languages, avatarUrl } = await req.json();
  if (!bio || !levelsTaught?.length || !languages?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.$transaction([
    db.teacherProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, bio, pricePerCredit: pricePerCredit ?? 10, creditCost: creditCost ?? 1, levelsTaught, languages },
      update: { bio, pricePerCredit: pricePerCredit ?? 10, creditCost: creditCost ?? 1, levelsTaught, languages },
    }),
    ...(avatarUrl ? [db.user.update({ where: { id: user.id }, data: { avatarUrl } })] : []),
  ]);

  return NextResponse.json({ ok: true });
}
