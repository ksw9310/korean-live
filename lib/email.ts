import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://koreanlive.live";

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KoreanLive</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:24px 32px;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Korean<span style="color:#a78bfa;">Live</span></span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;">
                KoreanLive · Live 1-on-1 Korean lessons<br/>
                <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">${APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function bookingConfirmedHtml({
  studentName,
  teacherName,
  scheduledAt,
  bookingId,
  role,
}: {
  studentName: string;
  teacherName: string;
  scheduledAt: Date;
  bookingId: string;
  role: "student" | "teacher";
}): string {
  const dateStr = scheduledAt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Session Confirmed ✅</h2>
    <p style="margin:0 0 24px;color:#71717a;font-size:15px;">
      ${role === "student"
        ? `Your lesson with <strong style="color:#18181b;">${teacherName}</strong> has been booked.`
        : `You have a new lesson booked with <strong style="color:#18181b;">${studentName}</strong>.`
      }
    </p>

    <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#71717a;font-size:13px;padding-bottom:8px;">Date & Time</td>
          <td style="color:#18181b;font-size:14px;font-weight:600;padding-bottom:8px;text-align:right;">${dateStr}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:13px;padding-bottom:8px;">Duration</td>
          <td style="color:#18181b;font-size:14px;font-weight:600;padding-bottom:8px;text-align:right;">50 minutes</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:13px;">${role === "student" ? "Tutor" : "Student"}</td>
          <td style="color:#18181b;font-size:14px;font-weight:600;text-align:right;">${role === "student" ? teacherName : studentName}</td>
        </tr>
      </table>
    </div>

    <a href="${APP_URL}/room/${bookingId}"
       style="display:block;background:#18181b;color:#ffffff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;margin-bottom:16px;">
      Join Session Room →
    </a>
    <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
      The room will be available 10 minutes before the session starts.
    </p>
  `;
  return baseLayout(content);
}

export function bookingCancelledHtml({
  studentName,
  teacherName,
  scheduledAt,
  role,
  refunded,
}: {
  studentName: string;
  teacherName: string;
  scheduledAt: Date;
  role: "student" | "teacher";
  refunded: boolean;
}): string {
  const dateStr = scheduledAt.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#18181b;">Session Cancelled ❌</h2>
    <p style="margin:0 0 24px;color:#71717a;font-size:15px;">
      Your session on <strong style="color:#18181b;">${dateStr}</strong> with
      <strong style="color:#18181b;">${role === "student" ? teacherName : studentName}</strong> has been cancelled.
    </p>
    ${refunded ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:500;">
        ✓ 1 credit has been refunded to your account.
      </p>
    </div>` : ""}
    <a href="${APP_URL}/teachers"
       style="display:block;background:#18181b;color:#ffffff;text-align:center;padding:14px 24px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">
      Browse Other Tutors →
    </a>
  `;
  return baseLayout(content);
}

// ─── Send helpers ──────────────────────────────────────────────────────────────

export async function sendBookingConfirmed({
  studentEmail,
  teacherEmail,
  studentName,
  teacherName,
  scheduledAt,
  bookingId,
}: {
  studentEmail: string;
  teacherEmail: string;
  studentName: string;
  teacherName: string;
  scheduledAt: Date;
  bookingId: string;
}) {
  const resend = getResend();
  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: studentEmail,
      subject: `✅ Session confirmed with ${teacherName} — KoreanLive`,
      html: bookingConfirmedHtml({ studentName, teacherName, scheduledAt, bookingId, role: "student" }),
    }),
    resend.emails.send({
      from: FROM,
      to: teacherEmail,
      subject: `📅 New session booked by ${studentName} — KoreanLive`,
      html: bookingConfirmedHtml({ studentName, teacherName, scheduledAt, bookingId, role: "teacher" }),
    }),
  ]);
}

export async function sendBookingCancelled({
  studentEmail,
  teacherEmail,
  studentName,
  teacherName,
  scheduledAt,
  refunded,
}: {
  studentEmail: string;
  teacherEmail: string;
  studentName: string;
  teacherName: string;
  scheduledAt: Date;
  refunded: boolean;
}) {
  const resend = getResend();
  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: studentEmail,
      subject: `Session cancelled — KoreanLive`,
      html: bookingCancelledHtml({ studentName, teacherName, scheduledAt, role: "student", refunded }),
    }),
    resend.emails.send({
      from: FROM,
      to: teacherEmail,
      subject: `Session cancelled — KoreanLive`,
      html: bookingCancelledHtml({ studentName, teacherName, scheduledAt, role: "teacher", refunded: false }),
    }),
  ]);
}
