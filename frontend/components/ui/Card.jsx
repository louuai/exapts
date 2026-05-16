import { cn } from '@/lib/utils';

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-2xl bg-white border border-ink-100 shadow-soft',
        hover && 'transition-all hover:shadow-card hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
