import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = await req.json();
  if (role !== "STUDENT" && role !== "TEACHER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await db.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
      avatarUrl: clerkUser.imageUrl,
      role,
    },
    update: { role },
  });

  return NextResponse.json({ ok: true });
}
