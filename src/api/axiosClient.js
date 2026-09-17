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

// Attach the bearer token (if present) to every outgoing request.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartdesk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses and handle expired/invalid sessions globally.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem("smartdesk_token");
        localStorage.removeItem("smartdesk_admin");
        // Avoid redirect loop if we're already on the login page.
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }

      // Shape a consistent error object for callers, whether the backend
      // sends { message }, { error }, or { errors: { field: [...] } } (422).
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
