export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 bg-white/5 rounded" />
        <div className="h-6 w-32 bg-white/5 rounded-lg" />
      </div>
      {/* Title */}
      <div className="h-9 w-2/3 bg-white/5 rounded-lg mb-4" />
      {/* Meta */}
      <div className="flex gap-4 mb-6">
        <div className="h-4 w-24 bg-white/5 rounded" />
        <div className="h-4 w-20 bg-white/5 rounded" />
      </div>
      <div className="border-t border-white/5 mb-6" />
      {/* Content lines */}
      <div className="flex flex-col gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className={`h-4 bg-white/5 rounded ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}
