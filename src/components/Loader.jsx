import React from "react";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader">
      <div className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
