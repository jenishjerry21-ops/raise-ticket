import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          SmartDesk
        </Link>

        <nav className="navbar__links">
          {isAuthenticated ? (
            <>
              <Link to="/admin/dashboard">Dashboard</Link>
              <Link to="/admin/tickets">Tickets</Link>
              <Link to="/admin/status-history">Status History</Link>
              <span className="navbar__admin">{admin?.name || admin?.email}</span>
              <button className="btn btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/">Raise a Ticket</Link>
              <Link to="/admin/login">Admin Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
