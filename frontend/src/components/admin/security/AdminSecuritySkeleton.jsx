const AdminSecuritySkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="h-9 w-64 rounded bg-slate-200" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      <div className="h-32 rounded-2xl bg-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="h-80 rounded-2xl bg-slate-200" />
        </div>

        <div className="h-72 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
};

export default AdminSecuritySkeleton;