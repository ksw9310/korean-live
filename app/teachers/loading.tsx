import { Skeleton } from "@/components/ui/skeleton";

export default function TeachersLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32 ml-auto" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
