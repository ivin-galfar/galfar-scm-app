export const normalizeDateForInput = (value) => {
  if (!value) return "";
  const date = String(value).trim();
  const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const dayFirstMatch = date.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dayFirstMatch) {
    return `${dayFirstMatch[3]}-${dayFirstMatch[2]}-${dayFirstMatch[1]}`;
  }

  const timestamp = new Date(date);
  if (Number.isNaN(timestamp.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(timestamp);
  const valueByPart = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${valueByPart.year}-${valueByPart.month}-${valueByPart.day}`;
};
