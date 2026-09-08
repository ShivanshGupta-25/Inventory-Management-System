import apiRequest from "./api";

export const loginUser = async ({ email, password }) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const registerUser = async ({
  name,
  email,
  password,
  role,
}) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
};

export const getCurrentUser = async (token) => {
  return apiRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};