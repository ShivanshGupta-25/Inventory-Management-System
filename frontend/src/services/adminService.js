import apiRequest from "./api";

// --------------------------------------------------
// ADMIN DASHBOARD
// --------------------------------------------------

export const getAdminDashboard = async () => {
  return apiRequest("/admin/dashboard", {
    method: "GET",
  });
};

// --------------------------------------------------
// GET USERS
// --------------------------------------------------

export const getAdminUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search) {
    params.set("search", search);
  }

  if (role) {
    params.set("role", role);
  }

  if (status) {
    params.set("status", status);
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  if (sortOrder) {
    params.set("sortOrder", sortOrder);
  }

  return apiRequest(
    `/admin/users?${params.toString()}`,
    {
      method: "GET",
    }
  );
};

// --------------------------------------------------
// GET USER
// --------------------------------------------------

export const getAdminUser = async (
  userId
) => {
  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "GET",
    }
  );
};

// --------------------------------------------------
// CREATE USER
// --------------------------------------------------

export const createAdminUser = async (
  userData
) => {
  return apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// --------------------------------------------------
// UPDATE USER
// --------------------------------------------------

export const updateAdminUser = async (
  userId,
  userData
) => {
  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(userData),
    }
  );
};

// --------------------------------------------------
// CHANGE ROLE
// --------------------------------------------------

export const updateAdminUserRole = async (
  userId,
  role
) => {
  return apiRequest(
    `/admin/users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role,
      }),
    }
  );
};

// --------------------------------------------------
// CHANGE STATUS
// --------------------------------------------------

export const updateAdminUserStatus = async (
  userId,
  status
) => {
  return apiRequest(
    `/admin/users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
};

// --------------------------------------------------
// DELETE USER
// --------------------------------------------------

export const deleteAdminUser = async (
  userId
) => {
  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
    }
  );
};

// --------------------------------------------------
// AUDIT LOGS
// --------------------------------------------------

export const getAdminAuditLogs = async ({
  page = 1,
  limit = 20,
  action = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (action) {
    params.set("action", action);
  }

  if (search) {
    params.set("search", search);
  }

  return apiRequest(
    `/admin/audit-logs?${params.toString()}`,
    {
      method: "GET",
    }
  );
};