// const API_URL = "http://localhost:5000/api/sales";

// export const getSales = async (params = {}) => {
//   const query = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (value) {
//       query.append(key, value);
//     }
//   });

//   const response = await fetch(
//     `${API_URL}?${query.toString()}`
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data.message || "Failed to fetch sales"
//     );
//   }

//   return data;
// };

// export const getSalesStats = async () => {
//   const response = await fetch(`${API_URL}/stats`);

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data.message || "Failed to fetch sales statistics"
//     );
//   }

//   return data;
// };

// export const getSaleById = async (id) => {
//   const response = await fetch(`${API_URL}/${id}`);

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data.message || "Failed to fetch sale"
//     );
//   }

//   return data;
// };

// export const createSale = async (saleData) => {
//   const response = await fetch(API_URL, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(saleData),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data.message || "Failed to create sale"
//     );
//   }

//   return data;
// };

// export const updateSale = async (
//   id,
//   saleData
// ) => {
//   const response = await fetch(
//     `${API_URL}/${id}`,
//     {
//       method: "PUT",
//       headers: {
//         "Content-Type":
//           "application/json",
//       },
//       body: JSON.stringify(
//         saleData
//       ),
//     }
//   );

//   const data =
//     await response.json();

//   if (!response.ok) {
//     throw new Error(
//       data.message ||
//         "Failed to update sale"
//     );
//   }

//   return data;
// };









import axios from "axios";

const API_URL = "http://localhost:5000/api";

/* Generic request helper */

const request = async (
  method,
  endpoint,
  data = null,
  params = null
) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      params,
    });

    return response.data;
  } catch (error) {
    console.error(
      `Sales API ${method} ${endpoint} failed:`,
      error
    );

    throw error;
  }
};

/* =========================
   GET SALES
========================= */

export const getSales = async (
  params = {}
) => {
  return request(
    "GET",
    "/sales",
    null,
    params
  );
};

/* =========================
   GET SALES STATISTICS
========================= */

export const getSalesStats = async () => {
  return request(
    "GET",
    "/sales/stats"
  );
};

/* =========================
   GET SALE BY ID
========================= */

export const getSaleById = async (id) => {
  return request(
    "GET",
    `/sales/${id}`
  );
};

/* =========================
   CREATE SALE
========================= */

export const createSale = async (data) => {
  return request(
    "POST",
    "/sales",
    data
  );
};

/* =========================
   UPDATE SALE
========================= */

export const updateSale = async (
  id,
  data
) => {
  return request(
    "PUT",
    `/sales/${id}`,
    data
  );
};

/* =========================
   DELETE SALE
========================= */

export const deleteSale = async (id) => {
  return request(
    "DELETE",
    `/sales/${id}`
  );
};

/* =========================
   UPDATE PAYMENT
========================= */

export const updateSalePayment = async (
  id,
  data
) => {
  return request(
    "PATCH",
    `/sales/${id}/payment`,
    data
  );
};

/* =========================
   GET SALE PAYMENT
========================= */

export const getSaleMovements = async (id) => {
  return request(
    "GET",
    `/sales/${id}/movements`
  );
};

/* =========================
   CANCEL SALE
========================= */

export const cancelSale = async (id) => {
  return request(
    "PATCH",
    `/sales/${id}/cancel`
  );
};

/* =========================
   RETURN SALE
========================= */

export const returnSale = async (
  id,
  data = {}
) => {
  return request(
    "PATCH",
    `/sales/${id}/return`,
    data
  );
};