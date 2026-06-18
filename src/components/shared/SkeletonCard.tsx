export function SkeletonCard({ lines = 2, image = false }: { lines?: number; image?: boolean }) {
  return (
    <div className="glass-card p-4 animate-pulse">
      {image && <div className="w-full h-48 bg-accent rounded-xl mb-4" />}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-accent rounded w-1/3" />
          <div className="h-2 bg-accent rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-accent rounded" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, lines = 1 }: { count?: number; lines?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="h-32 bg-accent rounded-xl mb-3" />
          <div className="h-4 bg-accent rounded w-2/3 mb-2" />
          {lines > 1 && <div className="h-3 bg-accent rounded w-1/2" />}
        </div>
      ))}
    </div>
  );
}
