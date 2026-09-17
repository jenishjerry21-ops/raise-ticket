import axiosClient from "./axiosClient";

// POST /api/auth/login  -> { token, admin }
export const login = (credentials) => {
  return axiosClient.post("https://localhost:7193/api/auth/login", credentials).then((res) => res.data);
};

export const logout = () => {
  localStorage.removeItem("smartdesk_token");
  localStorage.removeItem("smartdesk_admin");
};
