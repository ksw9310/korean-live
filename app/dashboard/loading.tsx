import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
