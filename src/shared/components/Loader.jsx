import { cn } from "@utils/helpers.js";

// ─────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────

export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "rounded-full border-primary border-t-transparent animate-spin",
        sizes[size],
        className
      )}
    />
  );
};

// ─────────────────────────────────────────
// PAGE LOADER
// ─────────────────────────────────────────

export const PageLoader = ({ message = "Loading..." }) => (
  <div className="page-loader">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-text-secondary text-sm animate-pulse">
        {message}
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────

export const SkeletonBox = ({ className = "" }) => (
  <div className={cn("skeleton", className)} />
);

export const SkeletonCard = () => (
  <div className="card space-y-3">
    <SkeletonBox className="h-48 w-full rounded-lg" />
    <SkeletonBox className="h-4 w-3/4" />
    <SkeletonBox className="h-4 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <SkeletonBox className="h-6 w-24" />
      <SkeletonBox className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 p-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonBox key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border-t border-border">
        {[...Array(4)].map((_, j) => (
          <SkeletonBox key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <SkeletonBox
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-2/3" : "w-full"
        )}
      />
    ))}
  </div>
);

// Default export
const Loader = PageLoader;
export default Loader;