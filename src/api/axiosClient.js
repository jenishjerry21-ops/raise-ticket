import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("smartdesk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        sessionStorage.removeItem("smartdesk_token");
        sessionStorage.removeItem("smartdesk_admin");
       
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
     
      const data = error.response.data || {};
      const normalized = {
        status,
        message: data.message || data.error || "Something went wrong. Please try again.",
        errors: data.errors || null,
      };
      return Promise.reject(normalized);
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Unable to reach the server. Please check your connection.",
        errors: null,
      });
    }

    return Promise.reject({ status: -1, message: error.message, errors: null });
  }
);
export default axiosClient;
