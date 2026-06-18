export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="blob-deco blob-1" />
      <div className="blob-deco blob-2" />
      <div className="blob-deco blob-3" />
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[240px] glass-sidebar z-40">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 animate-pulse" />
            <div className="h-4 w-28 rounded-full bg-amber-500/10 animate-pulse" />
          </div>
        </div>
        <div className="p-3 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-5 h-5 rounded-full bg-amber-500/10 animate-pulse" />
              <div className="h-3.5 w-24 rounded-full bg-amber-500/8 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 glass border-x-0 border-t-0 rounded-none">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4 lg:hidden">
              <div className="w-5 h-5 rounded bg-amber-500/10 animate-pulse" />
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 animate-pulse" />
            </div>
            <div className="hidden lg:block" />
            <div className="hidden sm:block h-9 w-full max-w-md rounded-full bg-amber-500/8 animate-pulse mx-4" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-amber-500/10 animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-amber-500/15 animate-pulse" />
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
          <div className="h-48 rounded-[1.5rem] bg-amber-500/5 animate-pulse" />
          <div className="h-32 rounded-[1.5rem] bg-amber-500/5 animate-pulse" />
          <div className="h-40 rounded-[1.5rem] bg-amber-500/5 animate-pulse" />
        </main>
      </div>
    </div>
  );
}
