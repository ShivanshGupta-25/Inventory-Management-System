import axios from "axios";

const API_URL = "http://localhost:5000/api";

/*
 * Get authentication token
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
 * Authentication headers
 */
const getAuthHeaders = () => {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

/*
 * Generic request helper
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
        `Staff Purchase Request API ${method} ${endpoint} failed:`,
        error
    );

    console.error(
        "Backend error response:",
        error?.response?.data
    );

    console.error(
        "Request payload:",
        data
    );

    throw error;
    }
}

/*
 * GET /api/purchase-orders
 *
 * Staff only receives their own
 * Purchase Requests.
 */
export const getStaffPurchaseRequests =
  async (params = {}) => {
    return request(
      "GET",
      "/purchase-orders",
      null,
      {
        ...params,

        requestType:
          "Purchase Request",

        mine: true,
      }
    );
  };

/*
 * GET /api/purchase-orders/:id
 */
export const getStaffPurchaseRequestById =
  async (id) => {
    return request(
      "GET",
      `/purchase-orders/${id}`
    );
  };

/*
 * POST /api/purchase-orders
 *
 * Backend automatically determines:
 *
 * Staff → Purchase Request
 */
export const createStaffPurchaseRequest =
  async (data) => {
    return request(
      "POST",
      "/purchase-orders",
      data
    );
  };

/*
 * POST /api/purchase-orders/:id/confirm
 *
 * For Staff this means:
 *
 * Draft → Pending
 */
export const submitStaffPurchaseRequest =
  async (id) => {
    return request(
      "POST",
      `/purchase-orders/${id}/confirm`,
      {}
    );
  };

/*
 * POST /api/purchase-orders/:id/cancel
 *
 * Staff can cancel their own
 * Draft Purchase Request.
 */
export const cancelStaffPurchaseRequest =
  async (id) => {
    return request(
      "POST",
      `/purchase-orders/${id}/cancel`,
      {}
    );
  };

/*
 * PUT /api/purchase-orders/:id
 *
 * Used for editing a Draft
 * Purchase Request.
 */
export const updateStaffPurchaseRequest =
  async (id, data) => {
    return request(
      "PUT",
      `/purchase-orders/${id}`,
      data
    );
  };