export default function LoadingSkeleton({ variant = "list", count = 3 }) {
  const height = variant === "list" ? "h-16" : variant === "dashboard" ? "h-32" : "h-40";
  const grid = variant === "list" ? "grid-cols-1" : variant === "dashboard" ? "grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className={`grid ${grid} gap-4 w-full`} role="status" aria-label="Loading content">
      <span className="sr-only">Loading content</span>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${height} rounded-2xl bg-current opacity-10 animate-pulse motion-reduce:animate-none`} />
      ))}
    </div>
  );
}