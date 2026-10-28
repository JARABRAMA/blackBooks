export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function availabilityFromCopies(
  copies: { status: string }[]
): { available: number; total: number; loaned: number } {
  const total = copies.length;
  const available = copies.filter((c) => c.status === "AVAILABLE").length;
  const loaned = copies.filter((c) => c.status === "LOANED").length;
  return { available, total, loaned };
}
