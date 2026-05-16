import { cn } from '@/lib/utils';

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-md', className)} />;
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="mt-4 space-y-2 px-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-5/6 mt-2" />
    </div>
  );
}
