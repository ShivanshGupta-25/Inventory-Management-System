const SaleStatus = ({ status }) => {
  const styles = {
    Completed:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    Cancelled:
      "bg-red-50 text-red-700 border-red-200",

    Returned:
      "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default SaleStatus;