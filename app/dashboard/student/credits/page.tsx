export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { CREDIT_PACKS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditPurchaseButton } from "./CreditPurchaseButton";

async function getCreditBalance(clerkId: string) {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { clerkId },
    include: { creditLedger: true },
  });
  if (!user) return null;
  const balance = user.creditLedger.reduce((sum, e) => sum + e.amount, 0);
  return { user, balance };
}

export default async function CreditsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const data = await getCreditBalance(clerkId);
  if (!data) redirect("/onboarding");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Buy Credits</h1>
        <p className="text-muted-foreground mt-1">
          Current balance: <span className="font-semibold text-foreground">{data.balance} credits</span>
        </p>
      </div>

      <div className="grid gap-4">
        {CREDIT_PACKS.map((pack) => (
          <Card key={pack.id} className={pack.popular ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pack.credits} Credits</CardTitle>
                <div className="flex items-center gap-2">
                  {pack.popular && <Badge>Most popular</Badge>}
                  <span className="text-2xl font-bold">${pack.price}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ${(pack.price / pack.credits).toFixed(1)}/session · {pack.description}
              </p>
            </CardHeader>
            <CardContent>
              <CreditPurchaseButton packId={pack.id} label={`Buy ${pack.credits} credits for $${pack.price}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Payments are processed securely by Stripe. Credits are non-refundable once a session is booked and confirmed.
      </p>
    </div>
  );
}
