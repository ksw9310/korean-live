import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Video,
  Star,
  Shield,
  Clock,
  CreditCard,
  Globe,
  ChevronRight,
  BookOpen,
  Users,
  Zap,
} from "lucide-react";

const CREDIT_PACKS = [
  {
    credits: 5,
    price: 49,
    perSession: "9.80",
    label: "Starter",
    highlight: false,
    desc: "Perfect for trying it out",
  },
  {
    credits: 10,
    price: 89,
    perSession: "8.90",
    label: "Popular",
    highlight: true,
    desc: "10% savings — most popular",
  },
  {
    credits: 20,
    price: 159,
    perSession: "7.95",
    label: "Best Value",
    highlight: false,
    desc: "20% savings — best value",
  },
];

const FEATURES = [
  {
    icon: Video,
    title: "Live 1-on-1 video",
    desc: "50-minute private sessions with a native Korean tutor, directly in your browser.",
  },
  {
    icon: Shield,
    title: "Verified tutors",
    desc: "Every tutor is screened and reviewed. Real native speakers, real results.",
  },
  {
    icon: Clock,
    title: "Flexible scheduling",
    desc: "Book sessions around your schedule. Tutors available across all time zones.",
  },
  {
    icon: Globe,
    title: "All levels welcome",
    desc: "From complete beginner to TOPIK advanced. We have a tutor for every level.",
  },
  {
    icon: CreditCard,
    title: "No subscriptions",
    desc: "Buy credits, use them whenever. No monthly fees, no contracts, no waste.",
  },
  {
    icon: Zap,
    title: "Start in minutes",
    desc: "Sign up, browse tutors, and book your first session in under 5 minutes.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Intermediate learner",
    text: "I've tried apps and group classes — nothing compares to 1:1 sessions. My conversational Korean improved dramatically in just a month.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "K-drama enthusiast",
    text: "Found the perfect tutor who matches my learning style. Booking is seamless and the video quality is excellent.",
    rating: 5,
  },
  {
    name: "Yuki M.",
    role: "TOPIK prep student",
    text: "Passed TOPIK Level 4 after 3 months of sessions. My tutor tailored every lesson to the exam format.",
    rating: 5,
  },
];

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl tracking-tight">
              Korean<span className="text-primary">Live</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/teachers" className="hover:text-foreground transition-colors">
                Browse tutors
              </Link>
              <Link href="/#pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/#how-it-works" className="hover:text-foreground transition-colors">
                How it works
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {userId ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/onboarding">Dashboard</Link>
                </Button>
                <UserButton />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Get started free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="absolute top-20 right-10 text-[200px] font-bold text-primary/5 select-none hidden lg:block leading-none">
          한국어
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-28 md:py-36">
          <div className="max-w-2xl space-y-6">
            <Badge variant="secondary" className="gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Tutors available now
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Speak Korean
              <br />
              <span className="text-primary">fluently</span>, faster.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Learn from verified native Korean tutors in live 1-on-1 video sessions.
              No subscriptions — just book when you're ready.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="gap-2 text-base px-6 h-12" asChild>
                <Link href="/teachers">
                  Find a tutor <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-6 h-12" asChild>
                <Link href="/sign-up?role=teacher">Teach on KoreanLive</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                4.9 avg. tutor rating
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span>50-min sessions</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active tutors" },
              { value: "10,000+", label: "Sessions completed" },
              { value: "4.9★", label: "Average rating" },
              { value: "50+", label: "Countries" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <Badge variant="outline">How it works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Start learning in 3 steps</h2>
            <p className="text-muted-foreground text-lg">No lengthy setup. No commitments.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-border" />
            {[
              {
                icon: CreditCard,
                step: "01",
                title: "Buy a credit pack",
                desc: "Choose from 5, 10, or 20 sessions. Pay once, use whenever. Credits never expire.",
              },
              {
                icon: Users,
                step: "02",
                title: "Pick your tutor",
                desc: "Filter by level, price, and availability. Read reviews and book a time.",
              },
              {
                icon: Video,
                step: "03",
                title: "Join & learn live",
                desc: "Click Join at session time. Camera, mic, everything works right in your browser.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-4 ring-background">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {item.step.slice(1)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <Badge variant="outline">Why KoreanLive</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to learn Korean</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 rounded-xl border border-border/60 bg-background hover:border-primary/30 transition-colors">
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <Badge variant="outline">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Buy credits once. No hidden fees, no subscriptions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className={`relative rounded-2xl border p-8 flex flex-col gap-4 transition-all ${
                  pack.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border/60 bg-background"
                }`}
              >
                {pack.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{pack.label}</p>
                  <p className="text-4xl font-bold mt-1">${pack.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">${pack.perSession} per session</p>
                </div>
                <Separator />
                <ul className="space-y-2 text-sm flex-1">
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <span>{pack.credits} live sessions (50 min each)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>Credits never expire</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 shrink-0" />
                    <span>{pack.desc}</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant={pack.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link href={userId ? "/dashboard/student/credits" : "/sign-up"}>
                    Get started
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-muted/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">What learners say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border/60">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Ready to speak Korean?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of learners improving their Korean every week.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" className="gap-2 text-base px-8 h-12" asChild>
              <Link href={userId ? "/teachers" : "/sign-up"}>
                Get started — it's free <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required to sign up.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <p className="font-bold text-lg">
                Korean<span className="text-primary">Live</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Live 1-on-1 Korean lessons with native tutors.
              </p>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-sm">Learn</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/teachers" className="hover:text-foreground transition-colors">Browse tutors</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link></li>
                <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-sm">Teach</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up?role=teacher" className="hover:text-foreground transition-colors">Become a tutor</Link></li>
                <li><Link href="/dashboard/teacher" className="hover:text-foreground transition-colors">Tutor dashboard</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="font-medium text-sm">Support</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ & Help</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground text-center mt-8">
            © 2026 KoreanLive. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
