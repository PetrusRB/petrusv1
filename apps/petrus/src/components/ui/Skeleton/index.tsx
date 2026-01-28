import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const skeletonVariants = cva(
  'relative overflow-hidden rounded-md bg-skeleton isolate',
  {
    variants: {
      variant: {
        default: '',
        text: 'h-4',
        title: 'h-6',
        avatar: 'rounded-full',
        card: 'h-32',
        button: 'h-10',
        image: 'aspect-video',
      },
      size: {
        sm: 'h-4',
        md: 'h-6',
        lg: 'h-10',
        xl: 'h-16',
        full: 'h-full w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, size, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(skeletonVariants({ variant, size }), className)}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-skeleton-shimmer/40 to-transparent" />
    </div>
  );
}

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-4/5' : 'w-full'}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card p-6 space-y-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton variant="avatar" className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-3 pt-2">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  );
}

function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6 space-y-8', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="text" className="w-64" />
        </div>
        <Skeleton variant="avatar" className="h-10 w-10" />
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Table-like section */}
      <div className="space-y-4">
        <Skeleton variant="title" className="w-32" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-lg border border-border/30"
            >
              <Skeleton variant="avatar" className="h-8 w-8" />
              <Skeleton variant="text" className="flex-1" />
              <Skeleton variant="button" className="w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonPage, skeletonVariants };
