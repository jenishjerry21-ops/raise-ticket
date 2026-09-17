import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStatusHistories } from "../../api/statusHistoryApi";
import { STATUS_OPTIONS } from "../../constants";
import { StatusBadge } from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { formatApiDate } from "../../utils/date";

const PAGE_SIZE = 10;

export default function StatusHistory() {
  const [histories, setHistories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [ticketId, setTicketId] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(() => {
    setLoading(true);
    setError("");

    getStatusHistories({
      page,
      pageSize: PAGE_SIZE,
      ...(ticketId && { ticketId }),
      ...(adminUserId && { adminUserId }),
      ...(status && { status }),
      sort,
    })
      .then((data) => {
        setHistories(data.items || data.Items || []);
        setTotalCount(data.totalCount ?? data.TotalCount ?? 0);
      })
      .catch((err) => setError(err.message || "Failed to load status history."))
      .finally(() => setLoading(false));
  }, [adminUserId, page, sort, status, ticketId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setTicketId("");
    setAdminUserId("");
    setStatus("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Status History</h1>
          <p className="muted">Review every admin status change across tickets.</p>
        </div>
        <Link to="/admin/tickets" className="btn btn--ghost">View Tickets</Link>
      </div>

      <div className="card">
        <form className="filter-bar" onSubmit={applyFilters}>
          <div className="filter-bar__row">
            <input
              className="input"
              type="number"
              min="1"
              placeholder="Ticket ID"
              value={ticketId}
              onChange={(event) => setTicketId(event.target.value)}
            />
            <input
              className="input"
              type="number"
              min="1"
              placeholder="Admin user ID"
              value={adminUserId}
              onChange={(event) => setAdminUserId(event.target.value)}
            />
            <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button type="submit" className="btn btn--primary">Apply Filters</button>
            <button type="button" className="btn btn--ghost" onClick={clearFilters}>Clear</button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {loading ? <Loader label="Loading status history..." /> : (
        <div className="card table-wrap">
          {histories.length === 0 ? <p className="muted">No status history found.</p> : (
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Change</th>
                  <th>Remark</th>
                  <th>Admin</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((history, index) => (
                  <tr key={history.id || history.Id || index}>
                    <td>
                      {history.ticketId || history.TicketId ? (
                        <Link className="table__link" to={`/admin/tickets/${history.ticketId || history.TicketId}`}>
                          #{history.ticketId || history.TicketId}
                        </Link>
                      ) : "-"}
                    </td>
                    <td>
                      <div className="badge-row">
                        <StatusBadge status={history.previousStatus || history.PreviousStatus} />
                        <span aria-hidden="true">-&gt;</span>
                        <StatusBadge status={history.newStatus || history.NewStatus} />
                      </div>
                    </td>
                    <td className="table__truncate" title={history.remark || history.Remark}>
                      {history.remark || history.Remark || "-"}
                    </td>
                    <td>
                      {history.adminName || history.AdminName || "Admin"}
                      <span className="small muted"> (#{history.adminUserId || history.AdminUserId || "-"})</span>
                    </td>
                    <td>{formatApiDate(history.createdAt || history.CreatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={page} perPage={PAGE_SIZE} total={totalCount} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}