import React, { useEffect, useState } from "react";
import { getDashboardStats, getTickets } from "../../api/ticketApi";
import { Link } from "react-router-dom";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import { formatApiDate } from "../../utils/date";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      getDashboardStats(),
      getTickets({ sort: "-created_at", page: 1, per_page: 1000, pageSize: 1000 }),
    ]).then(([statsResult, ticketsResult]) => {
      if (!active) return;

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      } else {
        setError(statsResult.reason?.message || "Failed to load dashboard statistics.");
      }

      if (ticketsResult.status === "fulfilled") {
        const data = ticketsResult.value;
        const rows = Array.isArray(data)
          ? data
          : data.data || data.tickets || data.results || data.items || [];
        setTickets(rows);
      } else {
        setTicketError(ticketsResult.reason?.message || "Failed to load tickets.");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;
  if (error && !stats && !tickets.length) return <div className="alert alert--error">{error}</div>;

  const dashboardData = stats?.dashboard || stats?.data || stats || {};
  const byStatus = dashboardData.by_status || dashboardData.byStatus || countBy(tickets, "status");
  const byCategory = dashboardData.by_category || dashboardData.byCategory || countBy(tickets, "category");
  const byPriority = dashboardData.by_priority || dashboardData.byPriority || countBy(tickets, "priority");
  const last7Days = dashboardData.last_7_days ?? dashboardData.last7Days ?? countRecentTickets(tickets);

  return (
    <div className="page">
      <h1>Dashboard</h1>
      {error && <div className="alert alert--error">{error}</div>}

      <div className="stat-grid">
        <div className="stat-card stat-card--highlight">
          <span className="stat-card__value">{last7Days}</span>
          <span className="stat-card__label">Tickets in last 7 days</span>
        </div>

        {Object.entries(byStatus).map(([status, count]) => (
          <div className="stat-card" key={status}>
            <span className="stat-card__value">{count}</span>
            <span className="stat-card__label">{status}</span>
          </div>
        ))}
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>By Category</h2>
          <BreakdownList data={byCategory} />
        </div>
        <div className="card">
          <h2>By Priority</h2>
          <BreakdownList data={byPriority} />
        </div>
      </div>

      <div className="card">
        <div className="page__header">
          <h2>All Raised Tickets</h2>
          <Link to="/admin/tickets" className="btn btn--secondary">View Tickets</Link>
        </div>
        {ticketError ? (
          <p className="alert alert--error">{ticketError}</p>
        ) : tickets.length === 0 ? (
          <p className="muted">No tickets found.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Subject</th>
                  <th>Email</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{getReference(ticket) || "—"}</td>
                    <td className="table__truncate">{ticket.subject}</td>
                    <td>{ticket.email}</td>
                    <td>{ticket.category}</td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                    <td><StatusBadge status={ticket.status} /></td>
                    <td>{formatApiDate(ticket.created_at || ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownList({ data }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <p className="muted">No data available.</p>;

  return (
    <ul className="breakdown-list">
      {entries.map(([label, value]) => (
        <li key={label}>
          <div className="breakdown-list__row">
            <span>{label}</span>
            <span>{value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function countBy(tickets, field) {
  return tickets.reduce((counts, ticket) => {
    const value = ticket[field] || ticket[field.replace("_", "")];
    if (value) counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function countRecentTickets(tickets) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return tickets.filter((ticket) => {
    const createdAt = ticket.created_at || ticket.createdAt;
    return createdAt && new Date(createdAt).getTime() >= cutoff;
  }).length;
}

function getReference(ticket) {
  return (
    ticket.reference_number ||
    ticket.referenceNumber ||
    ticket.reference ||
    ticket.ticket_number ||
    ticket.ticketNumber
  );
}

