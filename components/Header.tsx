import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export async function Header() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/teachers" className="hover:text-foreground transition-colors">
              Browse tutors
            </Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              FAQ
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
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
