const AdminUserSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden lg:block">
        <div className="h-12 border-b border-slate-200 bg-slate-50" />

        <div className="divide-y divide-slate-100">
          {Array.from({ length: 7 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex items-center gap-6 px-6 py-5"
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>

                <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
              </div>
            )
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />

                  <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
              </div>

              <div className="mt-4 flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminUserSkeleton;