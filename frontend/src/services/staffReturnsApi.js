import axios from "axios";

const API_URL = "http://localhost:5000/api";

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

const request = async (
  method,
  endpoint,
  data = null,
  params = null
) => {
  const token = getAuthToken();

  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      params,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    return response.data;
  } catch (error) {
    console.error(
      `Staff Returns API ${method} ${endpoint} failed:`,
      error
    );

    throw error;
  }
};

/**
 * Returns are represented by sales
 * whose status is "Returned".
 */
export const getStaffReturns = async (
  params = {}
) => {
  return request("GET", "/sales", null, {
    ...params,
    status: "Returned",
  });
};

export const getStaffReturnById = async (id) => {
  return request("GET", `/sales/${id}`);
};

export const processStaffReturn = async (
  id,
  data
) => {
  return request(
    "PATCH",
    `/sales/${id}/return`,
    data
  );
};

export const getStaffReturnMovements = async (
  id
) => {
  return request(
    "GET",
    `/sales/${id}/movements`
  );
};