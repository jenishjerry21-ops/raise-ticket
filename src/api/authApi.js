import axiosClient from "./axiosClient";

export const login = (credentials) => {
  return axiosClient.post("https://localhost:7193/api/auth/login", credentials).then((res) => res.data);
};

export const logout = () => {
  sessionStorage.removeItem("smartdesk_token");
  sessionStorage.removeItem("smartdesk_admin");
};
