import api from "./api";

export const registerUser = async (userData) => {

  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

};


export const loginUser = async (credentials) => {

  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

};