"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LEVEL_INFO } from "@/lib/constants";
import { toast } from "sonner";
import { Camera, CheckCircle2 } from "lucide-react";

const LANGUAGES = ["English", "Japanese", "Chinese", "Spanish", "French", "German", "Other"];

interface Props {
  initialBio: string;
  initialLevels: string[];
  initialLanguages: string[];
  initialAvatarUrl?: string;
}

export function TeacherProfileForm({ initialBio, initialLevels, initialLanguages, initialAvatarUrl }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(initialLevels);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl ?? "");

  const isEditing = !!initialBio;

  // Derive creditCost and earnings from selected levels
  const maxCreditCost = selectedLevels.length > 0
    ? Math.max(...selectedLevels.map((l) => LEVEL_INFO[l]?.creditCost ?? 1))
    : null;
  const pricePerCredit = 10; // 1 credit = $10 platform-wide
  const teacherEarnings = maxCreditCost ? (maxCreditCost * pricePerCredit * 0.8).toFixed(2) : null;

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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setAvatarPreview(initialAvatarUrl ?? "");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bio.trim()) { toast.error("Please write a short bio"); return; }
    if (selectedLevels.length === 0) { toast.error("Select at least one level you teach"); return; }
    if (selectedLanguages.length === 0) { toast.error("Select at least one language you speak"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          pricePerCredit,
          creditCost: maxCreditCost,
          levelsTaught: selectedLevels,
          languages: selectedLanguages,
          avatarUrl: avatarUrl || undefined,
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
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit your tutor profile" : "Set up your tutor profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              <p className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Click to upload profile photo (optional)"}</p>
            </div>

            {/* Bio */}
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

            {/* Level selection with descriptions */}
            <div className="space-y-3">
              <div>
                <Label>Levels you teach</Label>
                <p className="text-xs text-muted-foreground mt-1">Select all levels that apply. Your session rate is based on the highest level you teach.</p>
              </div>
              <div className="space-y-3">
                {Object.entries(LEVEL_INFO).map(([key, info]) => {
                  const selected = selectedLevels.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleLevel(key)}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{info.label}</span>
                            <span className="text-xs text-muted-foreground">{info.topik}</span>
                          </div>
                          <ul className="space-y-0.5">
                            {info.bullets.map((b) => (
                              <li key={b} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs font-medium text-violet-400 mt-2">
                            {info.creditCost} credit{info.creditCost > 1 ? "s" : ""}/session · ${info.price}/session for students
                          </p>
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Earnings preview */}
              {maxCreditCost && (
                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Your estimated earnings: </span>
                  <span className="font-semibold">${teacherEarnings}/session</span>
                  <span className="text-xs text-muted-foreground ml-1">(after 20% platform fee)</span>
                </div>
              )}
            </div>

            {/* Languages */}
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

            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading ? "Saving…" : isEditing ? "Save changes" : "Create profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
