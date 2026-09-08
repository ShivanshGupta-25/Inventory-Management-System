const StockStatus = ({ status }) => {
  const styles = {
    "In Stock":
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    "Low Stock":
      "bg-amber-50 text-amber-700 border-amber-200",

    "Out of Stock":
      "bg-red-50 text-red-700 border-red-200",

    Overstock:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] ||
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

      {status}
    </span>
  );
};

export default StockStatus;