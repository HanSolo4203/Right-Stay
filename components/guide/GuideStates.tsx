import type { ReactNode } from 'react';
import { Compass, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type GuideEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
};

export function GuideEmptyState({
  icon: Icon = Compass,
  title,
  body,
  action,
  className,
}: GuideEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-right-stay-500/15 text-right-stay-300">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <p className="font-display text-lg text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function GuideMapUnavailable({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[12rem] flex-col items-center justify-center bg-[#efe4cf]/94 px-6 text-center',
        className
      )}
      role="alert"
    >
      <p className="font-display text-lg text-[#3f3428]">Map couldn&apos;t load</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6d5e4c]">
        Check your connection and try again. The place list still works.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#337e2f] px-4 text-sm font-semibold text-white transition hover:bg-[#2a6527]"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
