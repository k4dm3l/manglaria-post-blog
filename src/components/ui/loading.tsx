import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'pulse' | 'dots';
}

export function Loading({ size = 'md', className, variant = 'default' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center justify-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary",
              sizeClasses[size],
              "animate-bounce",
              `animation-delay-${i * 100}`
            )}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn(
            "rounded-full bg-primary/20",
            sizeClasses[size],
            "animate-pulse"
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200",
          sizeClasses[size],
          "border-t-primary"
        )}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" variant="dots" />
    </div>
  );
}

export function LoadingTable() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading size="md" variant="pulse" />
    </div>
  );
}

export function LoadingSearch() {
  return (
    <div className="flex items-center justify-center py-2">
      <Loading size="sm" variant="dots" />
    </div>
  );
}

export function LoadingPagination() {
  return (
    <div className="flex items-center justify-center py-2">
      <Loading size="sm" variant="pulse" />
    </div>
  );
}

export function LoadingOverlay({ children, isLoading }: { children: React.ReactNode; isLoading: boolean }) {
  if (!isLoading) return <>{children}</>;
  
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loading size="lg" variant="dots" />
      </div>
      {children}
    </div>
  );
} 