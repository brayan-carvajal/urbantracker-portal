export const API_BASE_URL = "http://18.119.92.101:8080/api/v1/public/auth";

export const API_ENDPOINTS = {
  validateCode: `${API_BASE_URL}/validate-code`,
  forgotPassword: `${API_BASE_URL}/forgot-password`,
} as const;