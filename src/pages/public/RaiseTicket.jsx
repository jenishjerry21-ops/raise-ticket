import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../api/ticketApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = { name: "", email: "", subject: "", description: "" };

export default function RaiseTicket() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.description.trim()) next.description = "Description is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const data = await createTicket(form);
      // Expected shape: { reference_number: "TKT-00001", ... }
      navigate("/confirmation", { state: { ticket: data.ticket || data.data || data } });
    } catch (err) {
      if (err.errors) {
        // Map server-side field errors (422) onto the form.
        const fieldErrors = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        setServerError(err.message || "Failed to submit the ticket. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow">
      <div className="card">
        <h1>Raise a Support Ticket</h1>
        <p className="muted">
          Tell us what's going on and our team will get back to you. You'll receive a
          reference number you can use to track your ticket.
        </p>

        {serverError && <div className="alert alert--error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input input--error" : "input"}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input input--error" : "input"}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              className={errors.subject ? "input input--error" : "input"}
            />
            {errors.subject && <span className="field-error">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={form.description}
              onChange={handleChange}
              className={errors.description ? "input input--error" : "input"}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
