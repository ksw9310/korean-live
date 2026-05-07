import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const studentSteps = [
  {
    step: "1",
    title: "Create an account",
    desc: "Sign up and select the Student role during onboarding.",
  },
  {
    step: "2",
    title: "Buy credits",
    desc: "Go to Dashboard → Credits and purchase a credit pack. 1 credit = 1 lesson (50 min).",
  },
  {
    step: "3",
    title: "Find a teacher",
    desc: "Browse teachers, filter by level or price, and view their profile and availability.",
  },
  {
    step: "4",
    title: "Book a session",
    desc: "Pick an available time slot and confirm. Your credit is deducted instantly.",
  },
  {
    step: "5",
    title: "Join your lesson",
    desc: "At lesson time, go to Dashboard and click Join. The video room opens in your browser — no app needed.",
  },
];

const teacherSteps = [
  {
    step: "1",
    title: "Create an account",
    desc: "Sign up and select the Teacher role during onboarding.",
  },
  {
    step: "2",
    title: "Set up your profile",
    desc: "Add your bio, levels you teach, price per session, and languages you speak.",
  },
  {
    step: "3",
    title: "Set your availability",
    desc: "Go to Dashboard → Set Availability and mark the days and hours you're free each week.",
  },
  {
    step: "4",
    title: "Receive bookings",
    desc: "Students book your available slots. You'll receive a confirmation email for each new booking.",
  },
  {
    step: "5",
    title: "Teach and earn",
    desc: "Join the session from your dashboard. Earnings are tracked and payouts will be available soon.",
  },
];

const faqs = [
  {
    category: "Credits & Payments",
    items: [
      {
        q: "What is a credit?",
        a: "1 credit = 1 lesson session (50 minutes). Credits are purchased in packs and deducted automatically when you book a session.",
      },
      {
        q: "Do credits expire?",
        a: "No. Credits stay in your account until you use them.",
      },
      {
        q: "Can I get a refund on unused credits?",
        a: "Credits are non-refundable once purchased. However, if a session is cancelled, your credit is returned to your account.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via our secure payment partner.",
      },
    ],
  },
  {
    category: "Bookings & Cancellations",
    items: [
      {
        q: "How do I cancel a booking?",
        a: "Go to your Dashboard, find the booking, and click Cancel. Cancellations made more than 24 hours before the session receive a full credit refund.",
      },
      {
        q: "What if I cancel within 24 hours?",
        a: "Cancellations within 24 hours of the session are non-refundable to protect the teacher's time.",
      },
      {
        q: "What if the teacher cancels?",
        a: "If a teacher cancels, you always receive a full credit refund regardless of timing.",
      },
      {
        q: "Can I reschedule a booking?",
        a: "There is no reschedule option yet. Cancel the existing booking (if outside the 24-hour window) and book a new time slot.",
      },
    ],
  },
  {
    category: "Lessons & Video Calls",
    items: [
      {
        q: "What technology is used for video calls?",
        a: "Lessons take place directly in your browser using our built-in video room — no downloads or apps required.",
      },
      {
        q: "When can I enter the room?",
        a: "The room becomes available 10 minutes before your scheduled session start time.",
      },
      {
        q: "What if there are technical issues during a lesson?",
        a: "Try refreshing the page. If the issue persists, contact us at support@koreanlive.live and we'll resolve it.",
      },
      {
        q: "How long is each session?",
        a: "Each session is 50 minutes.",
      },
    ],
  },
  {
    category: "For Teachers",
    items: [
      {
        q: "Who can become a teacher?",
        a: "Any native or fluent Korean speaker can apply. Simply sign up as a teacher and complete your profile.",
      },
      {
        q: "How is my price set?",
        a: "You set your own price per session when creating your profile. You can update it anytime.",
      },
      {
        q: "How do payouts work?",
        a: "Payout functionality is coming soon. All earned credits are tracked in your dashboard.",
      },
      {
        q: "Can I manage my own schedule?",
        a: "Yes. In your dashboard you can set your weekly availability, and students can only book within those hours.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            Korean<span className="text-violet-400">Live</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teachers">Browse Teachers</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know about learning Korean on KoreanLive.
          </p>
        </div>

        {/* How it works — Students */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">For Students</span>
            <h2 className="text-2xl font-bold mt-1">How to start learning</h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-4">
            {studentSteps.map((s) => (
              <div key={s.step} className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                  {s.step}
                </div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Button asChild>
            <Link href="/teachers">Browse Teachers →</Link>
          </Button>
        </section>

        {/* How it works — Teachers */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">For Teachers</span>
            <h2 className="text-2xl font-bold mt-1">How to start teaching</h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-4">
            {teacherSteps.map((s) => (
              <div key={s.step} className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                  {s.step}
                </div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Become a Teacher →</Link>
          </Button>
        </section>

        {/* FAQ */}
        <section className="space-y-12">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          {faqs.map((cat) => (
            <div key={cat.category} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-400">
                {cat.category}
              </h3>
              <div className="divide-y border rounded-xl overflow-hidden">
                {cat.items.map((item) => (
                  <details key={item.q} className="group">
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-muted/40 transition-colors">
                      <span className="font-medium text-sm">{item.q}</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Contact */}
        <section className="rounded-xl border bg-muted/30 p-8 text-center space-y-3">
          <h2 className="text-xl font-bold">Still have questions?</h2>
          <p className="text-muted-foreground text-sm">
            Our support team is happy to help.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@koreanlive.live">Contact Support</a>
          </Button>
        </section>
      </main>

      <footer className="border-t mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-wrap gap-4 justify-between items-center text-sm text-muted-foreground">
          <span>© 2025 KoreanLive</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
