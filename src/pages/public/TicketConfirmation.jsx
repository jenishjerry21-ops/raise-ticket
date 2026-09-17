import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

export default function TicketConfirmation() {
  const { state } = useLocation();
  const ticket = state?.ticket;
  if (!ticket) {
    return <Navigate to="/" replace />;
  }

  const referenceNumber =
    ticket.reference_number ||
    ticket.referenceNumber ||
    ticket.reference ||
    ticket.ticket_number ||
    ticket.ticketNumber;

  return (
    <div className="page page--narrow">
      <div className="card card--center">
        <div className="confirmation__icon">✓</div>
        <h1>Ticket Submitted</h1>
        <p className="muted">
          Thanks, {ticket.name || "there"}. Your ticket has been received. Please save the
          reference number below — you'll need it for any follow-up.
        </p>

        <div className="reference-box">{referenceNumber || "—"}</div>

        <p className="muted small">
          A copy of this reference has also been noted against your email address:{" "}
          <strong>{ticket.email}</strong>
        </p>

        <Link to="/" className="btn btn--primary">
          Submit Another Ticket
        </Link>
      </div>
    </div>
  );
}
