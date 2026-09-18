import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getTicketById,
  updateTicketStatus,
  updateTicketClassification,
} from "../../api/ticketApi";
import { STATUS_OPTIONS, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "../../constants";
import Loader from "../../components/Loader";
import { formatApiDate } from "../../utils/date";

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
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
        setNewStatus(t.status === "InProgress" ? "In Progress" : t.status);
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
  const aiSummary = ticket.ai_summary || ticket.aiSummary || ticket.AiSummary;
  const aiCategory = ticket.ai_category || ticket.aiCategory || ticket.AiCategory || ticket.category;
  const aiPriority = ticket.ai_priority || ticket.aiPriority || ticket.AiPriority || ticket.priority;
  const referenceNumber =
    ticket.reference_number ||
    ticket.referenceNumber ||
    ticket.reference ||
    ticket.ticket_number ||
    ticket.ticketNumber;

  return (
    <div className="page">
      <Link to="/admin/tickets" className="back-link">← Back to Tickets</Link>

      <div className="page__header">
        <h1>{referenceNumber || "Ticket Details"}</h1>
      </div>

      <div className="grid-two">
        <div className="card">
          <h2>Ticket Details</h2>
          <dl className="detail-list">
            <dt>Subject</dt>
            <dd>{ticket.subject || "—"}</dd>
            <dt>Customer</dt>
            <dd>{ticket.name || "—"} ({ticket.email || "—"})</dd>
            <dt>Category</dt>
            <dd>{ticket.category || "—"}</dd>
            <dt>Description</dt>
            <dd className="detail-list__pre">{ticket.description || "—"}</dd>
            <dt>Created</dt>
            <dd>{formatApiDate(createdAt)}</dd>
          </dl>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setEditingStatus(true)}
          >
            Edit
          </button>
        </div>

        <div className="card">
          <h2>AI Suggestion</h2>
          {aiSummary || aiCategory || aiPriority ? (
            <dl className="detail-list">
              <dt>Suggested Category</dt>
              <dd>{aiCategory || "—"}</dd>
              <dt>Suggested Priority</dt>
              <dd>{aiPriority || "—"}</dd>
              <dt>Summary</dt>
              <dd className="detail-list__pre">{aiSummary || "—"}</dd>
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

      {editingStatus && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setEditingStatus(false);
        }}>
          <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="status-history-title">
            <div className="modal__header">
              <h2 id="status-history-title">Save Status History</h2>
              <button
                type="button"
                className="modal__close"
                aria-label="Close status history dialog"
                onClick={() => setEditingStatus(false)}
              >
                ×
              </button>
            </div>
            {statusError && <div className="alert alert--error">{statusError}</div>}
            <form onSubmit={handleStatusSubmit}>
            <div className="form-group">
              <label htmlFor="previousStatus">Previous Status</label>
              <select id="previousStatus" className="input" value={ticket.status} disabled>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
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
              {statusSubmitting ? "Saving…" : "Save Status History"}
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
          </div>
        </div>
      )}
    </div>
  );
}
