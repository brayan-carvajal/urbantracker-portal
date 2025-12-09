const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://3.142.222.206:8080/api/v1/public/auth";

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/login`,
  validateToken: `${API_BASE_URL}/validate-token`,
  new: `http://3.142.222.206:8080/api/v1/public/security/recovery-request/new`,
}as const;