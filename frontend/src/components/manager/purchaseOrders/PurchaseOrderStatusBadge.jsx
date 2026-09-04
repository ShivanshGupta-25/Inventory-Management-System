const PurchaseOrderStatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-600",
    Approved: "bg-blue-50 text-blue-600",
    "Partially Received":
      "bg-indigo-50 text-indigo-600",
    Received: "bg-emerald-50 text-emerald-600",
    Cancelled: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        styles[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
};

export default PurchaseOrderStatusBadge;