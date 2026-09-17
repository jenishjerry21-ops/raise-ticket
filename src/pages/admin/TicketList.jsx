import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTickets } from "../../api/ticketApi";
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../../constants";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import Loader from "../../components/Loader";

const PER_PAGE = 1000;

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("-created_at");

  const fetchTickets = useCallback(() => {
    setLoading(true);
    setError("");
    getTickets({
      search: search || undefined,
      status: status || undefined,
      category: category || undefined,
      priority: priority || undefined,
      sort,
      page,
      per_page: PER_PAGE,
      pageSize: PER_PAGE,
    })
      .then((data) => {
        // Expected shape: { data: [...], total, page, per_page }
        const rows = Array.isArray(data)
          ? data
          : data.data || data.tickets || data.results || data.items || [];
        setTickets(rows);
        setTotal(data.total ?? data.totalCount ?? data.count ?? rows.length);
      })
      .catch((err) => setError(err.message || "Failed to load tickets."))
      .finally(() => setLoading(false));
  }, [search, status, category, priority, sort, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setCategory("");
    setPriority("");
    setSort("-created_at");
    setPage(1);
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>Tickets</h1>
      </div>

      <div className="card filter-bar">
        <form onSubmit={handleSearchSubmit} className="filter-bar__search">
          <input
            type="text"
            className="input"
            placeholder="Search by reference, subject or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn--primary">Search</button>
        </form>

        <div className="filter-bar__row">
          <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select className="input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="input" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select className="input" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
          </select>

          <button type="button" className="btn btn--ghost" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <Loader label="Loading tickets…" />
      ) : tickets.length === 0 ? (
        <div className="card"><p className="muted">No tickets found.</p></div>
      ) : (
        <>
          <div className="table-wrap card">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/admin/tickets/${t.id}`} className="table__link">
                        {getReference(t) || "—"}
                      </Link>
                    </td>
                    <td className="table__truncate">{t.subject}</td>
                    <td>{t.email}</td>
                    <td>{t.category}</td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>{formatDate(t.created_at || t.createdAt)}</td>
                    <td>
                      <Link to={`/admin/tickets/${t.id}`} className="btn btn--secondary">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} perPage={PER_PAGE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
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

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}
