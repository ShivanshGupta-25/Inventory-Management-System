import apiRequest from "./api";

// ==================================================
// ADMIN DASHBOARD
// ==================================================

export const getAdminDashboard = async () => {
  return apiRequest("/admin/dashboard", {
    method: "GET",
  });
};

// ==================================================
// GET ADMIN USERS
// ==================================================

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

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
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

// ==================================================
// GET SINGLE ADMIN USER
// ==================================================

export const getAdminUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "GET",
    }
  );
};

// ==================================================
// CREATE ADMIN USER
// ==================================================

/*
 * Supported roles are controlled by the backend.
 *
 * Current intended roles:
 * - admin
 * - manager
 * - staff
 *
 * The frontend form can now send:
 *
 * {
 *   name,
 *   email,
 *   password,
 *   role: "admin" | "manager" | "staff"
 * }
 */

export const createAdminUser = async (userData) => {
  if (!userData) {
    throw new Error("User data is required.");
  }

  return apiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

// ==================================================
// UPDATE USER DETAILS
// ==================================================

/*
 * Backend updateUser() currently handles:
 *
 * - name
 * - email
 *
 * Role and status have their own endpoints.
 */

export const updateAdminUser = async (
  userId,
  userData
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!userData) {
    throw new Error("User data is required.");
  }

  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(userData),
    }
  );
};

// ==================================================
// CHANGE USER ROLE
// ==================================================

/*
 * Role changes are intentionally kept separate
 * from user creation/update.
 *
 * Backend currently controls which roles can be
 * assigned through this endpoint.
 */

export const updateAdminUserRole = async (
  userId,
  role
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!role) {
    throw new Error("User role is required.");
  }

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

// ==================================================
// CHANGE USER STATUS
// ==================================================

export const updateAdminUserStatus = async (
  userId,
  status
) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!status) {
    throw new Error("User status is required.");
  }

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

// ==================================================
// DELETE USER
// ==================================================

export const deleteAdminUser = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  return apiRequest(
    `/admin/users/${userId}`,
    {
      method: "DELETE",
    }
  );
};

// ==================================================
// GET ADMIN AUDIT LOGS
// ==================================================

export const getAdminAuditLogs = async ({
  page = 1,
  limit = 20,
  action = "",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (action) {
    params.set("action", action);
  }

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return apiRequest(
    `/admin/audit-logs?${params.toString()}`,
    {
      method: "GET",
    }
  );
};


// --------------------------------------------------
// ADMIN PROFILE
// --------------------------------------------------

export const getAdminProfile = async () => {
  return apiRequest("/admin/profile", {
    method: "GET",
  });
};

export const updateAdminProfile = async (data) => {
  return apiRequest("/admin/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};