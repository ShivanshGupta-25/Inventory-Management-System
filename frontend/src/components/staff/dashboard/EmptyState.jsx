const EmptyState = ({
  icon: Icon,
  message,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
        <Icon size={18} />
      </div>

      <p className="text-xs font-medium text-slate-500">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;