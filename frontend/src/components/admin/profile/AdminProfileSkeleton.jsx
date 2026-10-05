const AdminProfileSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-28 bg-slate-200" />

        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex items-end gap-4">
            <div className="h-24 w-24 rounded-2xl border-4 border-white bg-slate-300" />

            <div className="space-y-2 pb-1">
              <div className="h-6 w-40 rounded bg-slate-200" />
              <div className="h-4 w-52 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="h-[460px] rounded-2xl border border-slate-200 bg-white" />

        <div className="h-[360px] rounded-2xl border border-slate-200 bg-white" />
      </div>

      <div className="h-36 rounded-2xl border border-slate-200 bg-white" />

      <div className="h-56 rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
};

export default AdminProfileSkeleton;