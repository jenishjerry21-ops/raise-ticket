const timezonePattern = /(?:Z|[+-]\d{2}:?\d{2})$/i;

export function parseApiDate(value) {
  if (!value) return null;
  const text = String(value);
  const normalized = timezonePattern.test(text) ? text : `${text}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function formatApiDate(value, options = {}) {
  const date = parseApiDate(value);
  if (!date) return "—";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
}
