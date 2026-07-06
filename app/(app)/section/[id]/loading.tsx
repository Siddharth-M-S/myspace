export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 bg-white/5 rounded" />
        <div className="h-7 w-40 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-white/5 rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  )
}
