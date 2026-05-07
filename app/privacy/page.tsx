export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: May 2026</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <p className="text-muted-foreground leading-relaxed">
          We collect information you provide directly, including your name, email address, and profile information. We also collect usage data such as pages visited and sessions booked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use your information to provide and improve the Platform, process payments, send booking confirmations, and communicate important updates about your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Information Sharing</h2>
        <p className="text-muted-foreground leading-relaxed">
          We do not sell your personal information. We share data only with service providers necessary to operate the Platform (authentication, payments, video calls) and as required by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4. Data Security</h2>
        <p className="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures to protect your data. Payment information is handled by our payment processor and is never stored on our servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use cookies for authentication and to improve your experience. You can control cookies through your browser settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Your Rights</h2>
        <p className="text-muted-foreground leading-relaxed">
          You may request access to, correction of, or deletion of your personal data at any time by contacting us at support@koreanlive.live.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For privacy-related questions, contact us at support@koreanlive.live.
        </p>
      </section>
    </div>
  );
}
