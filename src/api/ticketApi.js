import axiosClient from "./axiosClient";

export const createTicket = (payload) => {
  return axiosClient.post("https://localhost:7193/api/tickets", payload).then((res) => res.data);
};

export const getTickets = (params = {}) => {
  return axiosClient
    .get("https://localhost:7193/api/tickets", { params })
    .then((res) => res.data);
};

export const getTicketById = (id) => {
  return axiosClient.get(`https://localhost:7193/api/tickets/${id}`).then((res) => res.data);
};

export const updateTicketStatus = (id, payload) => {
  return axiosClient.patch(`/tickets/${id}/status`, payload).then((res) => res.data);
};

export const updateTicketClassification = (id, payload) => {
  return axiosClient.patch(`https://localhost:7193/api/tickets/${id}/classification`, payload).then((res) => res.data);
};

export const getDashboardStats = () => {
  return axiosClient.get("https://localhost:7193/api/tickets/dashboard").then((res) => res.data);
};
