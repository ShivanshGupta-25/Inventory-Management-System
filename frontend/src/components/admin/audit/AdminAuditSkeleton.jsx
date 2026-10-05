const AdminAuditSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="animate-pulse divide-y divide-slate-100">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 px-5 py-5"
          >
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-slate-200" />

              <div className="h-3 w-full max-w-xl rounded bg-slate-200" />

              <div className="h-3 w-40 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAuditSkeleton;