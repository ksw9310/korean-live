import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DAILY_API = "https://api.daily.co/v1";
const DAILY_KEY = process.env.DAILY_API_KEY!;

async function dailyFetch(path: string, method = "GET", body?: object) {
  const res = await fetch(`${DAILY_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DAILY_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`Daily API error: ${res.status}`);
  return res.json();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookingId } = await params;
  const db = getDb();

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { student: true, teacher: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const isParticipant = booking.studentId === user.id || booking.teacherId === user.id;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
  }

  // Allow entry from 30 minutes before to 30 minutes after session end
  const now = Date.now();
  const openAt = new Date(booking.scheduledAt).getTime() - 30 * 60 * 1000;
  const closeAt = new Date(booking.scheduledAt).getTime() + (booking.durationMins + 30) * 60 * 1000;
  if (now < openAt) {
    const minsUntil = Math.ceil((openAt - now) / 60000);
    return NextResponse.json(
      { error: `Room opens 30 minutes before the session. Opens in ${minsUntil} minutes.` },
      { status: 400 }
    );
  }
  if (now > closeAt) {
    return NextResponse.json({ error: "This session has already ended." }, { status: 400 });
  }

  // Create Daily.co room lazily
  let roomName = booking.roomName;
  let roomUrl = booking.roomUrl;
  if (!roomName) {
    const roomExpiry = new Date(booking.scheduledAt);
    roomExpiry.setMinutes(roomExpiry.getMinutes() + booking.durationMins + 15);

    const room = await dailyFetch("/rooms", "POST", {
      name: `kl-${bookingId}`,
      privacy: "private",
      properties: {
        exp: Math.floor(roomExpiry.getTime() / 1000),
        enable_recording: "local",
        max_participants: 2,
      },
    });

    roomName = room.name;
    roomUrl = room.url;
    await db.booking.update({
      where: { id: bookingId },
      data: { roomName: room.name, roomUrl: room.url },
    });
  }

  // Generate participant token
  const isOwner = booking.teacherId === user.id;
  const tokenExpiry = new Date(booking.scheduledAt);
  tokenExpiry.setMinutes(tokenExpiry.getMinutes() + booking.durationMins + 30);

  const token = await dailyFetch("/meeting-tokens", "POST", {
    properties: {
      room_name: roomName,
      user_name: user.name,
      exp: Math.floor(tokenExpiry.getTime() / 1000),
      is_owner: isOwner,
    },
  });

  return NextResponse.json({ roomName, roomUrl, token: token.token });
}
