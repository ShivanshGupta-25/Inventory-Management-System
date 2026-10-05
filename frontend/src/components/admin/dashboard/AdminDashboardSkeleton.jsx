const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-9 w-52 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-14 w-48 animate-pulse rounded-xl bg-slate-100" />
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          )
        )}
      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-8" />

        <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white xl:col-span-4" />
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;