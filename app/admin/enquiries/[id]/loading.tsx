import { Skeleton } from "@/components/ui/skeleton";

/**
 * A dynamic route with no `loading` boundary is not prefetched at all, so
 * clicking an enquiry used to sit on the old page until the server answered.
 * With this file the shell is prefetched, the navigation happens on the click
 * and the enquiry streams into the outline below.
 *
 * Laid out to match `page.tsx`, so nothing jumps when the real content lands.
 */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-14 pb-12 md:px-8 md:pt-10">
      <Skeleton className="h-5 w-28" />

      <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="mt-1.5 h-6 w-20 rounded-full" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>

      <section className="mb-6 rounded-xl border p-4">
        <Skeleton className="h-3 w-16" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-7 w-36" />
        </div>
      </section>

      <section className="mb-6 rounded-xl border">
        <div className="divide-y">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4"
            >
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full max-w-sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-xl border p-4">
        <Skeleton className="h-3 w-24" />
        <div className="mt-3 grid gap-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
      </section>

      <span className="sr-only" role="status">
        Loading enquiry…
      </span>
    </div>
  );
}
