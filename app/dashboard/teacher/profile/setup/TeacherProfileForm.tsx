"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LEVEL_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { Camera } from "lucide-react";

const LANGUAGES = ["English", "Japanese", "Chinese", "Spanish", "French", "German", "Other"];

interface Props {
  initialBio: string;
  initialPrice: number;
  initialLevels: string[];
  initialLanguages: string[];
  initialAvatarUrl?: string;
}

export function TeacherProfileForm({ initialBio, initialPrice, initialLevels, initialLanguages, initialAvatarUrl }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [pricePerCredit, setPricePerCredit] = useState(String(initialPrice));
  const [selectedLevels, setSelectedLevels] = useState<string[]>(initialLevels);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(initialLanguages);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl ?? "");

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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit your tutor profile" : "Set up your tutor profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Avatar Upload */}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <p className="text-xs text-muted-foreground">
                {uploading ? "Uploading…" : "Click to upload profile photo (optional)"}
              </p>
            </div>

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

            <Button type="submit" className="w-full" disabled={loading || uploading}>
              {loading ? "Saving…" : isEditing ? "Save changes" : "Create profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
