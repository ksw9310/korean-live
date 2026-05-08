"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LEVEL_LABELS } from "@/lib/constants";

const LEVELS = Object.entries(LEVEL_LABELS) as [keyof typeof LEVEL_LABELS, string][];

export function TeachersFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const level = params.get("level") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== "all") {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`/teachers?${next.toString()}`);
    },
    [params, router]
  );

  const hasFilters = !!level;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Level filter */}
      <Select value={level || "all"} onValueChange={(v) => update("level", v)}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All levels" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          {LEVELS.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>


      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/teachers")}
          className="text-muted-foreground"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
