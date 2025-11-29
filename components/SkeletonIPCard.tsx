export function SkeletonIPCard() {
  return (
    <div className="bg-zinc-900/60 backdrop-blur-md rounded-3xl overflow-hidden border border-white/5 shadow-lg h-full flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-zinc-800" />
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-6 bg-zinc-800 rounded mb-2 w-3/4" />
        <div className="h-4 bg-zinc-800 rounded mb-1 w-full" />
        <div className="h-4 bg-zinc-800 rounded mb-4 w-2/3" />
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800" />
            <div className="h-3 bg-zinc-800 rounded w-16" />
          </div>
          <div className="h-6 bg-zinc-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
