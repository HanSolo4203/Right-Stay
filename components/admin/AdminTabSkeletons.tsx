import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('rounded-md bg-slate-200/80 animate-pulse', className)} />;
}

function TabShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 lg:p-8" aria-busy="true" aria-label="Loading">
      {children}
    </div>
  );
}

function FormSectionSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-6 space-y-4">
      <Bone className="h-5 w-40" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-3.5 w-24" />
          <Bone className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SiteSettingsSkeleton() {
  return (
    <TabShell>
      <div className="space-y-6">
        <FormSectionSkeleton fields={4} />
        <FormSectionSkeleton fields={3} />
        <Bone className="h-11 w-32 ml-auto" />
      </div>
    </TabShell>
  );
}

export function PropertySettingsSkeleton() {
  return (
    <TabShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-2">
          <Bone className="h-7 w-36" />
          <Bone className="h-4 w-56" />
        </div>
        <Bone className="h-10 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
            <Bone className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <Bone className="h-5 w-3/4" />
              <Bone className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Bone className="h-8 w-16" />
                <Bone className="h-8 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </TabShell>
  );
}

export function PricingDashboardSkeleton() {
  return (
    <TabShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Bone className="h-7 w-44" />
        <Bone className="h-10 w-64" />
      </div>
      <TableSkeleton rows={5} cols={5} />
    </TabShell>
  );
}

export function TourPackageSettingsSkeleton() {
  return (
    <TabShell>
      <div className="flex items-center justify-between mb-6">
        <Bone className="h-7 w-40" />
        <Bone className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4 flex gap-4">
            <Bone className="h-16 w-16 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Bone className="h-5 w-2/5" />
              <Bone className="h-4 w-full max-w-md" />
              <Bone className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </TabShell>
  );
}

export function BookingManagementSkeleton() {
  return (
    <TabShell>
      <div className="flex flex-wrap gap-3 mb-6">
        <Bone className="h-10 flex-1 min-w-[12rem]" />
        <Bone className="h-10 w-36" />
        <Bone className="h-10 w-28" />
      </div>
      <TableSkeleton rows={6} cols={6} />
    </TabShell>
  );
}

export function PropertyMappingSkeleton() {
  return (
    <TabShell>
      <div className="flex items-center justify-between mb-6">
        <Bone className="h-7 w-48" />
        <Bone className="h-10 w-36" />
      </div>
      <TableSkeleton rows={4} cols={4} />
    </TabShell>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="px-4 py-3 flex gap-4 border-b border-slate-100 last:border-0"
        >
          {Array.from({ length: cols }).map((_, col) => (
            <Bone key={col} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
