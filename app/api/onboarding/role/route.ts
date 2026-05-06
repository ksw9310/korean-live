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

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User";

  const db = getDb();

  // Google OAuth로 재가입 시 이메일은 같지만 clerkId가 다를 수 있음 → 병합 처리
  const existingByEmail = await db.user.findUnique({ where: { email } });
  if (existingByEmail && existingByEmail.clerkId !== clerkId) {
    await db.user.update({
      where: { email },
      data: { clerkId, role, avatarUrl: clerkUser.imageUrl },
    });
  } else {
    await db.user.upsert({
      where: { clerkId },
      create: { clerkId, email, name, avatarUrl: clerkUser.imageUrl, role },
      update: { role },
    });
  }

  return NextResponse.json({ ok: true });
}
