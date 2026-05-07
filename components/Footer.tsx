import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-lg tracking-tight">
              Korean<span className="text-primary">Live</span>
            </Link>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              1-on-1 live Korean lessons with native tutors. Book by credit, learn at your pace.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Learn</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/teachers" className="hover:text-foreground transition-colors">Browse tutors</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How it works</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Teach</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/sign-up" className="hover:text-foreground transition-colors">Become a tutor</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">Tutor guide</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} KoreanLive. All rights reserved.</p>
          <p>Made with ♥ for Korean learners worldwide</p>
        </div>
      </div>
    </footer>
  );
}
