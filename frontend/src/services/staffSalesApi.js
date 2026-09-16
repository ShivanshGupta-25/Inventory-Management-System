import axios from "axios";

const API_URL = "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

const getAuthToken = () => {
  const tokenKeys = [
    "token",
    "authToken",
    "accessToken",
  ];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/*
|--------------------------------------------------------------------------
| Generic Request
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
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(
      `Staff Sales API ${method} ${endpoint} failed:`,
      error
    );

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET STAFF SALES
|--------------------------------------------------------------------------
*/

export const getStaffSales = async (
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

export const getStaffSalesStats = async () => {
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

export const getStaffSaleById = async (
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

export const createStaffSale = async (
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

export const updateStaffSale = async (
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
| UPDATE PAYMENT
|--------------------------------------------------------------------------
*/

export const updateStaffSalePayment = async (
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
| CANCEL SALE
|--------------------------------------------------------------------------
*/

export const cancelStaffSale = async (
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

export const returnStaffSale = async (
  id,
  data = {}
) => {
  return request(
    "PATCH",
    `/sales/${id}/return`,
    data
  );
};

/*
|--------------------------------------------------------------------------
| GET SALE INVENTORY MOVEMENTS
|--------------------------------------------------------------------------
*/

export const getStaffSaleMovements = async (
  id
) => {
  return request(
    "GET",
    `/sales/${id}/movements`
  );
};