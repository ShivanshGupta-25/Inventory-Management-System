import axios from "axios";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   GET INVENTORY
========================================================= */

export const getInventory = async (params = {}) => {
  const response = await axios.get(
    `${API_URL}/inventory`,
    {
      params,
    }
  );

  return response.data;
};


/* =========================================================
   GET INVENTORY STATS
========================================================= */

export const getInventoryStats = async () => {
  const response = await axios.get(
    `${API_URL}/inventory/stats`
  );

  return response.data;
};


/* =========================================================
   GET SINGLE INVENTORY
========================================================= */

export const getInventoryById = async (id) => {
  const response = await axios.get(
    `${API_URL}/inventory/${id}`
  );

  return response.data;
};


/* =========================================================
   CREATE INVENTORY
   Manager/Admin operation
========================================================= */

export const createInventory = async (data) => {
  const response = await axios.post(
    `${API_URL}/inventory`,
    data
  );

  return response.data;
};


/* =========================================================
   UPDATE INVENTORY
   Manager/Admin operation
========================================================= */

export const updateInventory = async (
  id,
  data
) => {
  const response = await axios.put(
    `${API_URL}/inventory/${id}`,
    data
  );

  return response.data;
};


/* =========================================================
   DELETE INVENTORY
   Manager/Admin operation
========================================================= */

export const deleteInventory = async (id) => {
  const response = await axios.delete(
    `${API_URL}/inventory/${id}`
  );

  return response.data;
};


/* =========================================================
   GENERIC STOCK ADJUSTMENT
========================================================= */

export const adjustStock = async (
  id,
  data
) => {
  const response = await axios.post(
    `${API_URL}/inventory/${id}/adjust`,
    data
  );

  return response.data;
};


/* =========================================================
   STOCK IN
========================================================= */

export const stockIn = async (
  id,
  quantity,
  reason
) => {
  return adjustStock(id, {
    type: "IN",
    quantity,
    reason,
  });
};


/* =========================================================
   STOCK OUT
========================================================= */

export const stockOut = async (
  id,
  quantity,
  reason
) => {
  return adjustStock(id, {
    type: "OUT",
    quantity,
    reason,
  });
};


/* =========================================================
   STOCK MOVEMENTS
========================================================= */

export const getStockMovements = async (
  inventoryId
) => {
  const response = await axios.get(
    `${API_URL}/stock-movements/${inventoryId}`
  );

  return response.data;
};