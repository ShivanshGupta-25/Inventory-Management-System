const SaleStatusBadge = ({ status }) => {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Cancelled: "bg-red-50 text-red-700",
  };

  const dotStyles = {
    Completed: "bg-emerald-500",
    Pending: "bg-amber-500",
    Cancelled: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          dotStyles[status] || "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
};

export default SaleStatusBadge;