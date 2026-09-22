import { cn } from '@/lib/utils';

function Pulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-white/10', className)} />;
}

function ParchmentPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[#dccdb3]/70', className)} />;
}

export function GuidePlaceCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3 pb-6" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <div className="flex w-full flex-col sm:flex-row">
              <Pulse className="aspect-[16/10] w-full rounded-none sm:aspect-auto sm:min-h-[10rem] sm:w-44 lg:w-40" />
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <Pulse className="h-5 w-20 rounded-full" />
                  <Pulse className="h-4 w-10" />
                </div>
                <Pulse className="h-6 w-3/5" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-2/3" />
              </div>
            </div>
            <div className="flex justify-end border-t border-white/10 px-4 py-3">
              <Pulse className="h-4 w-20" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GuideMapPaneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('guide-map-shell h-full min-h-0', className)}
      aria-hidden="true"
      aria-busy="true"
    >
      <div
        className="guide-map-frame relative h-full min-h-0 overflow-hidden"
        style={{ background: '#efe4cf' }}
      >
        <div className="absolute inset-0">
          <ParchmentPulse className="absolute left-[12%] top-[18%] h-24 w-36 rounded-full opacity-70" />
          <ParchmentPulse className="absolute right-[18%] top-[28%] h-32 w-32 rounded-full opacity-50" />
          <ParchmentPulse className="absolute bottom-[22%] left-[28%] h-20 w-48 rounded-full opacity-60" />
          <div className="absolute left-[42%] top-[40%] h-3.5 w-3.5 rounded-full bg-[#337e2f]/50" />
          <div className="absolute left-[58%] top-[52%] h-3.5 w-3.5 rounded-full bg-[#c2410c]/40" />
          <div className="absolute left-[33%] top-[61%] h-3.5 w-3.5 rounded-full bg-[#1d4ed8]/40" />
        </div>
        <div className="guide-map-kicker">
          <span className="guide-map-kicker-mark">Cape Town</span>
          <span className="guide-map-kicker-sep">·</span>
          <span>Things to do</span>
        </div>
      </div>
    </div>
  );
}

export function ThingsToDoExplorerSkeleton() {
  return (
    <div
      className="flex h-[calc(100dvh-var(--site-header-height))] flex-col bg-[#121816] text-white"
      aria-busy="true"
      aria-label="Loading Cape Town guide"
    >
      <header className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <Pulse className="h-3 w-28" />
        <Pulse className="mt-3 h-8 w-64 sm:w-80" />
        <Pulse className="mt-3 h-4 w-full max-w-md" />
        <div className="mt-4 flex gap-2 overflow-hidden">
          <Pulse className="h-10 w-14 shrink-0 rounded-full" />
          <Pulse className="h-10 w-28 shrink-0 rounded-full" />
          <Pulse className="h-10 w-24 shrink-0 rounded-full" />
          <Pulse className="h-10 w-32 shrink-0 rounded-full" />
          <Pulse className="h-10 w-20 shrink-0 rounded-full" />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="min-h-0 overflow-hidden px-4 py-4 sm:px-6 lg:px-6">
          <GuidePlaceCardListSkeleton />
        </section>
        <section className="hidden min-h-0 p-3 lg:block lg:h-full lg:p-4">
          <GuideMapPaneSkeleton className="h-full min-h-0 w-full" />
        </section>
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-2 lg:hidden">
        <Pulse className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
