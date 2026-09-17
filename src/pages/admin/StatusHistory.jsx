import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createStatusHistory, getStatusHistories } from "../../api/statusHistoryApi";
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
  const [previousStatus, setPreviousStatus] = useState("Open");
  const [newStatus, setNewStatus] = useState("In Progress");
  const [remark, setRemark] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadHistory = useCallback(() => {
    setLoading(true);
    setError("");

    getStatusHistories({
      page,
      pageSize: PAGE_SIZE,
      ...(ticketId && { ticketId }),
      ...(adminUserId && { adminUserId }),
      ...(statusFilter && { status: statusFilter }),
      sort,
    })
      .then((data) => {
        setHistories(data.items || data.Items || []);
        setTotalCount(data.totalCount ?? data.TotalCount ?? 0);
      })
      .catch((err) => setError(err.message || "Failed to load status history."))
      .finally(() => setLoading(false));
  }, [adminUserId, page, sort, statusFilter, ticketId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    loadHistory();
  };

  const clearFilters = () => {
    setTicketId("");
    setAdminUserId("");
    setStatusFilter("");
    setSort("newest");
    setPage(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!ticketId || !previousStatus || !newStatus) {
      setError("Ticket ID, previous status, and new status are required.");
      return;
    }

    if (!remark.trim()) {
      setError("Remark is required before saving the status change.");
      return;
    }

    setSubmitting(true);

    try {
      await createStatusHistory({
        ticketId,
        previousStatus,
        newStatus,
        remark: remark.trim(),
        adminUserId: adminUserId || undefined,
      });

      setSuccess("Status history saved successfully.");
      setTicketId("");
      setPreviousStatus("Open");
      setNewStatus("In Progress");
      setRemark("");
      setAdminUserId("");
      setPage(1);
      loadHistory();
    } catch (err) {
      setError(err.message || "Failed to save status history.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Status History</h1>
          <p className="muted">Save every status transition with the ticket history details.</p>
        </div>
        <Link to="/admin/tickets" className="btn btn--ghost">View Tickets</Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="ticketId">Ticket ID</label>
              <input
                id="ticketId"
                className="input"
                type="number"
                min="1"
                value={ticketId}
                onChange={(event) => setTicketId(event.target.value)}
                placeholder="e.g. 12"
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminUserId">Admin User ID</label>
              <input
                id="adminUserId"
                className="input"
                type="number"
                min="1"
                value={adminUserId}
                onChange={(event) => setAdminUserId(event.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="previousStatus">Previous Status</label>
              <select
                id="previousStatus"
                className="input"
                value={previousStatus}
                onChange={(event) => setPreviousStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="newStatus">New Status</label>
              <select
                id="newStatus"
                className="input"
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="remark">Remark</label>
              <textarea
                id="remark"
                className="input"
                rows={3}
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="Started checking the issue"
              />
            </div>
          </div>

          {error && <div className="alert alert--error">{error}</div>}
          {success && <div className="alert alert--success">{success}</div>}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Status History"}
          </button>
        </form>
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
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
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
                  <th>Id</th>
                  <th>TicketId</th>
                  <th>PreviousStatus</th>
                  <th>NewStatus</th>
                  <th>Remark</th>
                  <th>AdminUserId</th>
                  <th>CreatedAt</th>
                </tr>
              </thead>
              <tbody>
                {histories.map((history, index) => (
                  <tr key={history.id || history.Id || index}>
                    <td>{history.id || history.Id || "-"}</td>
                    <td>
                      {history.ticketId || history.TicketId ? (
                        <Link className="table__link" to={`/admin/tickets/${history.ticketId || history.TicketId}`}>
                          #{history.ticketId || history.TicketId}
                        </Link>
                      ) : "-"}
                    </td>
                    <td>
                      <StatusBadge status={history.previousStatus || history.PreviousStatus} />
                    </td>
                    <td>
                      <StatusBadge status={history.newStatus || history.NewStatus} />
                    </td>
                    <td>{history.remark || history.Remark || "-"}</td>
                    <td>{history.adminUserId || history.AdminUserId || "-"}</td>
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