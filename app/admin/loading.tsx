import { Skeleton } from "@/components/ui/skeleton";

/** Dashboard shell. Also the fallback for any admin route without its own. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <div className="mb-6">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-2 h-4 w-full max-w-md" />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-xl border p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-8 w-12" />
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="divide-y rounded-xl border">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-1.5 h-3 w-28" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>

      <span className="sr-only" role="status">
        Loading dashboard…
      </span>
    </div>
  );
}
