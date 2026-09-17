import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getTicketById,
  updateTicketStatus,
  updateTicketClassification,
} from "../../api/ticketApi";
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../../constants";
import { StatusBadge, PriorityBadge } from "../../components/StatusBadge";
import Loader from "../../components/Loader";
import { formatApiDate } from "../../utils/date";

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newStatus, setNewStatus] = useState("");
  const [remark, setRemark] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState("");
  const [overrideSuccess, setOverrideSuccess] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    getTicketById(id)
      .then((data) => {       
        const t = data.ticket || data;
        setTicket(t);
        setHistory(data.status_history || t.status_history || []);
        setNewStatus(t.status);
        setCategory(t.category);
        setPriority(t.priority);
      })
      .catch((err) => setError(err.message || "Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusError("");

    if (!remark.trim()) {
      setStatusError("A remark is required when updating status.");
      return;
    }

    setStatusSubmitting(true);
    try {
      await updateTicketStatus(id, { status: newStatus, remark: remark.trim() });
      setRemark("");
      setEditingStatus(false);
      load();
    } catch (err) {
      setStatusError(err.message || "Failed to update status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    setOverrideError("");
    setOverrideSuccess("");

    setOverrideSubmitting(true);
    try {
      await updateTicketClassification(id, { category, priority });
      setOverrideSuccess("Category and priority updated.");
      load();
    } catch (err) {
      setOverrideError(err.message || "Failed to update classification.");
    } finally {
      setOverrideSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading ticket…" />;
  if (error) return <div className="alert alert--error">{error}</div>;
  if (!ticket) return null;

  const createdAt = ticket.created_at || ticket.createdAt || ticket.CreatedAt;

  return (
    <div className="page">
      <Link to="/admin/tickets" className="back-link">← Back to Tickets</Link>

      <div className="page__header">
        <h1>{ticket.reference_number}</h1>
        <div className="badge-row">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>Ticket Details</h2>
          <dl className="detail-list">
            <dt>Subject</dt>
            <dd>{ticket.subject}</dd>
            <dt>Customer</dt>
            <dd>{ticket.name} ({ticket.email})</dd>
            <dt>Category</dt>
            <dd>{ticket.category}</dd>
            <dt>Description</dt>
            <dd className="detail-list__pre">{ticket.description}</dd>
            <dt>Created</dt>
            <dd>{formatApiDate(createdAt)}</dd>
          </dl>
        </div>

        <div className="card">
          <h2>AI Suggestion</h2>
          {ticket.ai_summary || ticket.ai_category || ticket.ai_priority ? (
            <dl className="detail-list">
              <dt>Suggested Category</dt>
              <dd>{ticket.ai_category || "—"}</dd>
              <dt>Suggested Priority</dt>
              <dd>{ticket.ai_priority || "—"}</dd>
              <dt>Summary</dt>
              <dd className="detail-list__pre">{ticket.ai_summary || "—"}</dd>
            </dl>
          ) : (
            <p className="muted">
              No AI suggestion is available for this ticket (the AI call may have failed or
              timed out, in which case default values were kept).
            </p>
          )}

          <hr className="divider" />

          <h3>Override Classification</h3>
          {overrideError && <div className="alert alert--error">{overrideError}</div>}
          {overrideSuccess && <div className="alert alert--success">{overrideSuccess}</div>}
          <form onSubmit={handleOverrideSubmit}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn--secondary" disabled={overrideSubmitting}>
              {overrideSubmitting ? "Saving…" : "Save Override"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>Update Status</h2>
          {statusError && <div className="alert alert--error">{statusError}</div>}
          {!editingStatus ? (
            <>
              <p className="muted">Current status: <StatusBadge status={ticket.status} /></p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setEditingStatus(true)}
              >
                Edit Status
              </button>
            </>
          ) : (
            <form onSubmit={handleStatusSubmit}>
            <div className="form-group">
              <label htmlFor="status">New Status</label>
              <select
                id="status"
                className="input"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="remark">Remark</label>
              <textarea
                id="remark"
                className="input"
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Explain the reason for this status change…"
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={statusSubmitting}>
              {statusSubmitting ? "Updating…" : "Update Status"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setEditingStatus(false);
                setNewStatus(ticket.status);
                setRemark("");
                setStatusError("");
              }}
            >
              Cancel
            </button>
            </form>
          )}
        </div>

        <div className="card">
          <h2>Status History</h2>
          {history.length === 0 ? (
            <p className="muted">No status changes recorded yet.</p>
          ) : (
            <ul className="timeline">
              {history.map((h, idx) => (
                <li key={h.id || idx} className="timeline__item">
                  <div className="timeline__row">
                    <StatusBadge status={h.previous_status} />
                    <span className="timeline__arrow">→</span>
                    <StatusBadge status={h.new_status} />
                  </div>
                  {h.remark && <p className="timeline__remark">{h.remark}</p>}
                  <p className="timeline__meta">
                    {h.admin_name || h.admin_user || h.adminName || "Admin"} ·{" "}
                    {formatApiDate(h.created_at || h.createdAt || h.CreatedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
