export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Refund Policy</h1>
      <p className="text-muted-foreground">Last updated: May 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Credit Pack Purchases</h2>
        <p className="text-muted-foreground leading-relaxed">
          Credit packs are eligible for a full refund within 14 days of purchase, provided no credits have been used. Once any credits have been spent, the remaining credits are non-refundable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Cancelled Sessions</h2>
        <p className="text-muted-foreground leading-relaxed">
          If a student cancels a booked session more than 24 hours before the scheduled start time, the credit will be returned to their account. Cancellations within 24 hours of the session are non-refundable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Tutor No-Show</h2>
        <p className="text-muted-foreground leading-relaxed">
          If a tutor fails to attend a confirmed session, the student will receive a full credit refund automatically. Repeated no-shows by a tutor will result in account suspension.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Technical Issues</h2>
        <p className="text-muted-foreground leading-relaxed">
          If a session cannot be completed due to technical issues on our Platform, the credit will be refunded. Technical issues on the user's side (internet, device) are not eligible for refund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. How to Request a Refund</h2>
        <p className="text-muted-foreground leading-relaxed">
          To request a refund, contact us at support@koreanlive.live with your account email and the reason for the refund. We will process eligible refunds within 5–10 business days.
        </p>
      </section>
    </div>
  );
}
