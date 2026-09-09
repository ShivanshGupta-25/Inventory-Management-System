// const API_URL =
//   "http://localhost:5000/api/sales";

// export const getSales = async (params = {}) => {
//   const query = new URLSearchParams();

//   Object.entries(params).forEach(
//     ([key, value]) => {
//       if (value) {
//         query.append(key, value);
//       }
//     }
//   );

//   const response = await fetch(
//     `${API_URL}?${query.toString()}`
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch sales");
//   }

//   return response.json();
// };


// export const getSalesStats = async () => {
//   const response = await fetch(
//     `${API_URL}/stats`
//   );

//   if (!response.ok) {
//     throw new Error(
//       "Failed to fetch sales statistics"
//     );
//   }

//   return response.json();
// };


// export const getSaleById = async (id) => {
//   const response = await fetch(
//     `${API_URL}/${id}`
//   );

//   if (!response.ok) {
//     throw new Error(
//       "Failed to fetch sale"
//     );
//   }

//   return response.json();
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


const API_URL = "http://localhost:5000/api/sales";

export const getSales = async (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.append(key, value);
    }
  });

  const response = await fetch(
    `${API_URL}?${query.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch sales"
    );
  }

  return data;
};

export const getSalesStats = async () => {
  const response = await fetch(`${API_URL}/stats`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch sales statistics"
    );
  }

  return data;
};

export const getSaleById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch sale"
    );
  }

  return data;
};

export const createSale = async (saleData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(saleData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create sale"
    );
  }

  return data;
};