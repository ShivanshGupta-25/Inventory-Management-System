const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-600">
        <Icon size={17} />
      </div>

      <p className="text-xs font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </button>
  );
};

export default QuickAction;