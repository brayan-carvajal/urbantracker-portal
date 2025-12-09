import { API_ENDPOINTS } from "../app/auth/login/services/api/config";

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINTS.validateToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}