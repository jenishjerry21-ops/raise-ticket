import axiosClient from "./axiosClient";

const normalizeStatusValue = (status) => {
  if (!status) return "";
  return status.replace(/\s+/g, "");
};

export const getStatusHistories = (params = {}) => {
  return axiosClient
    .get("https://localhost:7193/api/status-histories", { params })
    .then((res) => res.data);
};

export const createStatusHistory = (payload) => {
  const normalizedPayload = {
    ...payload,
    ticketId: Number(payload.ticketId),
    previousStatus: normalizeStatusValue(payload.previousStatus),
    newStatus: normalizeStatusValue(payload.newStatus),
    adminUserId: payload.adminUserId ? Number(payload.adminUserId) : undefined,
  };

  return axiosClient
    .post("https://localhost:7193/api/status-histories", normalizedPayload)
    .then((res) => res.data);
};