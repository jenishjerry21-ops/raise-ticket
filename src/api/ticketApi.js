import axiosClient from "./axiosClient";

// POST /api/tickets (public) -> creates ticket, triggers AI classification
export const createTicket = (payload) => {
  return axiosClient.post("https://localhost:7193/api/tickets", payload).then((res) => res.data);
};

// GET /api/tickets (token) -> list with filters + server-side pagination
// params: { search, status, category, priority, sort, page, per_page }
export const getTickets = (params = {}) => {
  return axiosClient
    .get("https://localhost:7193/api/tickets", { params })
    .then((res) => res.data);
};

// GET /api/tickets/{id} (token) -> ticket details + status history
export const getTicketById = (id) => {
  return axiosClient.get(`https://localhost:7193/api/tickets/${id}`).then((res) => res.data);
};

// PATCH /api/tickets/{id}/status (token) -> { status, remark }
export const updateTicketStatus = (id, payload) => {
  return axiosClient.patch(`/tickets/${id}/status`, payload).then((res) => res.data);
};

// PATCH /api/tickets/{id} (token) -> admin override of AI category/priority
// (Not explicitly listed as a separate endpoint in the spec; many teams
// reuse the status endpoint or add this one. Kept here so the UI has a
// single place to call — adjust the path if your backend differs.)
export const updateTicketClassification = (id, payload) => {
  return axiosClient.patch(`https://localhost:7193/api/tickets/${id}/classification`, payload).then((res) => res.data);
};

// GET /api/dashboard (token) -> counts by status/category/priority + last 7 days
// Not in the REST table but required by the Dashboard screen (section 5.6).
export const getDashboardStats = () => {
  return axiosClient.get("https://localhost:7193/api/tickets/dashboard").then((res) => res.data);
};
