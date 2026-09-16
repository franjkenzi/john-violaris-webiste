import { Skeleton } from "@/components/ui/skeleton";

/** Matches the inbox table in `page.tsx`, so the switch is a fill, not a jump. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <div className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-lg" />
        ))}
      </div>

      <div className="rounded-xl border">
        <div className="border-b bg-muted/50 px-4 py-2.5">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-1.5 h-3 w-52" />
              </div>
              <Skeleton className="hidden h-4 w-32 sm:block" />
              <Skeleton className="hidden h-4 w-28 md:block" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading enquiries…
      </span>
    </div>
  );
}
