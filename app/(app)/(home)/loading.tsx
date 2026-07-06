export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-48 bg-white/5 rounded-lg" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  )
}
