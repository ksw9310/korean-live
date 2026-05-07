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
  const maxPrice = params.get("maxPrice") ?? "";
  const sort = params.get("sort") ?? "rating";

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

  const hasFilters = level || maxPrice;

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

      {/* Max price filter */}
      <Select value={maxPrice || "all"} onValueChange={(v) => update("maxPrice", v)}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Any price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any price</SelectItem>
          <SelectItem value="10">Up to $10</SelectItem>
          <SelectItem value="15">Up to $15</SelectItem>
          <SelectItem value="20">Up to $20</SelectItem>
          <SelectItem value="25">Up to $25</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={(v) => update("sort", v)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Top rated</SelectItem>
          <SelectItem value="price_asc">Price: low → high</SelectItem>
          <SelectItem value="price_desc">Price: high → low</SelectItem>
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
