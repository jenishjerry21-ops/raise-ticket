import axiosClient from "./axiosClient";

export const getStatusHistories = (params = {}) => {
  return axiosClient
    .get("https://localhost:7193/api/status-histories", { params })
    .then((res) => res.data);
};