import API from "./api";

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const login = (data: LoginPayload) => API.post("/api/auth/login", data);
export const register = (data: RegisterPayload) => API.post("/api/auth/register", data);
export const getCurrentUser = () => API.get("/api/auth/me");
export const updateUserProfile = (data: {username?: string, email?: string}) =>
  API.put("/api/auth/profile", data);
export const changePassword = (data: {currentPassword: string, newPassword: string}) =>
  API.put("/api/auth/password", data);