import React from "react";

export default function Pagination({ page, perPage, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (totalPages <= 1) return null;

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const pages = [];
  const windowSize = 2;
  for (let p = Math.max(1, page - windowSize); p <= Math.min(totalPages, page + windowSize); p++) {
    pages.push(p);
  }

  return (
    <div className="pagination">
      <button className="btn btn--ghost" disabled={page === 1} onClick={() => goTo(page - 1)}>
        Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button className="pagination__num" onClick={() => goTo(1)}>1</button>
          {pages[0] > 2 && <span className="pagination__ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__num ${p === page ? "pagination__num--active" : ""}`}
          onClick={() => goTo(p)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="pagination__ellipsis">…</span>}
          <button className="pagination__num" onClick={() => goTo(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className="btn btn--ghost" disabled={page === totalPages} onClick={() => goTo(page + 1)}>
        Next
      </button>
    </div>
  );
}
