import apiRequest from "./api";

// =====================================================
// LOGIN
// =====================================================

export const loginUser = async ({
  email,
  password,
}) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// =====================================================
// TWO-FACTOR AUTHENTICATION
// =====================================================

export const verifyTwoFactorOTP = async ({
  challengeId,
  otp,
}) => {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      challengeId,
      otp,
    }),
  });
};

export const resendTwoFactorOTP = async ({
  challengeId,
}) => {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({
      challengeId,
    }),
  });
};

// =====================================================
// REGISTRATION
// =====================================================

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

// =====================================================
// EMAIL VERIFICATION
// =====================================================

export const verifyEmail = async ({
  verificationId,
  otp,
}) => {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      verificationId,
      otp,
    }),
  });
};

export const resendEmailVerification = async ({
  verificationId,
}) => {
  return apiRequest("/auth/resend-email-verification", {
    method: "POST",
    body: JSON.stringify({
      verificationId,
    }),
  });
};

// --------------------------------------------------
// TWO-FACTOR AUTHENTICATION SETTINGS
// --------------------------------------------------

export const updateTwoFactorSettings = async ({ enabled }) =>
  apiRequest("/auth/two-factor", {
    method: "PATCH",
    body: JSON.stringify({
      enabled,
    }),
  });

// =====================================================
// CURRENT USER
// =====================================================

export const getCurrentUser = async (token) => {
  return apiRequest("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};