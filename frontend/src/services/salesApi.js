import axios from "axios";

const API_URL = "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Your backend JWT contains:
|
| {
|   userId: user._id,
|   role: user.role
| }
|
| authMiddleware reads the token and sets:
|
| req.user = decoded
|
|--------------------------------------------------------------------------
*/

/*
 * Get the currently stored authentication token.
 *
 * "token" is the primary key.
 * The fallbacks make the service compatible if
 * the authentication code uses another common key.
 */
const getAuthToken = () => {
  const tokenKeys = [
    "token",
    "authToken",
    "accessToken",
  ];

  for (const key of tokenKeys) {
    const token =
      localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
};

/*
 * Build authentication headers.
 */
const getAuthHeaders = () => {
  const token = getAuthToken();

  if (!token) {
    console.warn(
      "Sales API: No authentication token found in localStorage."
    );

    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/*
|--------------------------------------------------------------------------
| Generic request helper
|--------------------------------------------------------------------------
*/

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

      /*
       * Send JWT with every Sales request.
       */
      headers: getAuthHeaders(),
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

/*
|--------------------------------------------------------------------------
| GET SALES
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET SALES STATISTICS
|--------------------------------------------------------------------------
*/

export const getSalesStats = async () => {
  return request(
    "GET",
    "/sales/stats"
  );
};

/*
|--------------------------------------------------------------------------
| GET SALE BY ID
|--------------------------------------------------------------------------
*/

export const getSaleById = async (
  id
) => {
  return request(
    "GET",
    `/sales/${id}`
  );
};

/*
|--------------------------------------------------------------------------
| CREATE SALE
|--------------------------------------------------------------------------
*/

export const createSale = async (
  data
) => {
  return request(
    "POST",
    "/sales",
    data
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE SALE
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| DELETE SALE
|--------------------------------------------------------------------------
|
| NOTE:
| Your current backend salesRoutes.js does not
| define a DELETE /sales/:id route.
|
| This function is kept for compatibility with
| existing frontend imports, but the backend
| currently uses the cancel endpoint instead.
|--------------------------------------------------------------------------
*/

export const deleteSale = async (
  id
) => {
  return request(
    "DELETE",
    `/sales/${id}`
  );
};

/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| GET SALE MOVEMENTS
|--------------------------------------------------------------------------
*/

export const getSaleMovements = async (
  id
) => {
  return request(
    "GET",
    `/sales/${id}/movements`
  );
};

/*
|--------------------------------------------------------------------------
| CANCEL SALE
|--------------------------------------------------------------------------
*/

export const cancelSale = async (
  id,
  data = {}
) => {
  return request(
    "PATCH",
    `/sales/${id}/cancel`,
    data
  );
};

/*
|--------------------------------------------------------------------------
| RETURN SALE
|--------------------------------------------------------------------------
*/

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