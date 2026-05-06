"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABELS } from "@/lib/constants";
import { toast } from "sonner";

const LANGUAGES = ["English", "Japanese", "Chinese", "Spanish", "French", "German", "Other"];

interface Props {
  initialBio: string;
  initialPrice: number;
  initialLevels: string[];
  initialLanguages: string[];
}

export function TeacherProfileForm({ initialBio, initialPrice, initialLevels, initialLanguages }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [pricePerCredit, setPricePerCredit] = useState(String(initialPrice));
  const [selectedLevels, setSelectedLevels] = useState<string[]>(initialLevels);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);

  const isEditing = !!initialBio;

  function toggleLevel(level: string) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }

  function toggleLanguage(lang: string) {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.trim()) { toast.error("Please write a short bio"); return; }
    if (selectedLevels.length === 0) { toast.error("Select at least one level you teach"); return; }
    if (selectedLanguages.length === 0) { toast.error("Select at least one language you speak"); return; }
    const price = parseFloat(pricePerCredit);
    if (isNaN(price) || price < 5 || price > 100) {
      toast.error("Price must be between $5 and $100"); return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          pricePerCredit: price,
          levelsTaught: selectedLevels,
          languages: selectedLanguages,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Profile updated!" : "Profile created!");
      router.push("/dashboard/teacher");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit your tutor profile" : "Set up your tutor profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>About you</Label>
              <Textarea
                placeholder="Hi! I'm a native Korean speaker from Seoul with 3 years of teaching experience…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Levels you teach</Label>
                {selectedLevels.length > 0 && (
                  <span className="text-xs text-muted-foreground">{selectedLevels.length} selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={selectedLevels.includes(key) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleLevel(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select all levels you can teach. Multiple selection allowed. Students can only book sessions for the levels you select.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Languages you speak</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang}
                    variant={selectedLanguages.includes(lang) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleLanguage(lang)}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price per session (USD)</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="5"
                  max="100"
                  step="0.5"
                  value={pricePerCredit}
                  onChange={(e) => setPricePerCredit(e.target.value)}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">per 50-min session (you keep 80%)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You&apos;ll earn ${(parseFloat(pricePerCredit || "0") * 0.8).toFixed(2)} per session after platform fee.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : isEditing ? "Save changes" : "Create profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
