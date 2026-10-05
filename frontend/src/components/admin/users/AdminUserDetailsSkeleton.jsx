const AdminUserDetailsSkeleton = () => {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>

          <div className="space-y-6">
            <div className="h-56 animate-pulse rounded-2xl bg-white" />
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsSkeleton;