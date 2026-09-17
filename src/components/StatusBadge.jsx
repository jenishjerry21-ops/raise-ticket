import React from "react";
import { STATUS_COLORS, PRIORITY_COLORS } from "../constants";

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return (
    <span className="badge" style={{ "--badge-color": color }}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || "#6b7280";
  return (
    <span className="badge" style={{ "--badge-color": color }}>
      {priority}
    </span>
  );
}
