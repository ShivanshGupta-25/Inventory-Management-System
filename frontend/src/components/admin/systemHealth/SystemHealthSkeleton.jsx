const SystemHealthSkeleton = () => {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="h-20 animate-pulse rounded-2xl bg-white" />

        <div className="h-28 animate-pulse rounded-2xl bg-white" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="h-80 animate-pulse rounded-2xl bg-white" />

          <div className="h-80 animate-pulse rounded-2xl bg-white" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>

      </div>
    </div>
  );
};

export default SystemHealthSkeleton;