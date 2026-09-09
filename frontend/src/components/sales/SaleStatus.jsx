const statusStyles = {
  Completed:
    "bg-green-50 text-green-700 border-green-200",

  Cancelled:
    "bg-red-50 text-red-700 border-red-200",

  Returned:
    "bg-orange-50 text-orange-700 border-orange-200",

  Paid:
    "bg-green-50 text-green-700 border-green-200",

  Pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200",

  Partial:
    "bg-blue-50 text-blue-700 border-blue-200",

  Refunded:
    "bg-purple-50 text-purple-700 border-purple-200",
};

const SaleStatus = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
        statusStyles[status] ||
        "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
};

export default SaleStatus;