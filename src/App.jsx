import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RaiseTicket from "./pages/public/RaiseTicket";
import TicketConfirmation from "./pages/public/TicketConfirmation";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import TicketList from "./pages/admin/TicketList";
import TicketDetail from "./pages/admin/TicketDetail";
import StatusHistory from "./pages/admin/StatusHistory";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Public */}
            <Route path="/" element={<RaiseTicket />} />
            <Route path="/confirmation" element={<TicketConfirmation />} />

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <PrivateRoute>
                  <TicketList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tickets/:id"
              element={
                <PrivateRoute>
                  <TicketDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/status-history"
              element={
                <PrivateRoute>
                  <StatusHistory />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<RaiseTicket />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
