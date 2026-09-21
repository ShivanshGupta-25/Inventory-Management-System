const API_URL =
  "http://localhost:5000/api";

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("token");

  const headers = {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),

    ...(options.headers || {}),
  };

  // Let the browser set the correct
  // multipart boundary for FormData.
  if (
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get(
      "content-type"
    );

  const data =
    contentType?.includes(
      "application/json"
    )
      ? await response.json()
      : null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Something went wrong"
    );
  }

  return data;
};

export const registerUser = async (
  userData
) => {
  return apiRequest(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(
        userData
      ),
    }
  );
};

export const loginUser = async (
  credentials
) => {
  return apiRequest(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(
        credentials
      ),
    }
  );
};

export const getCurrentUser =
  async () => {
    return apiRequest(
      "/auth/me",
      {
        method: "GET",
      }
    );
  };

export default apiRequest;