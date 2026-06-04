export function toDateTimeLocal(value: string | null) {
  if (!value) return ""
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  return normalized.slice(0, 16)
}

export function formatDate(value: string | null) {
  if (!value) return "Fecha por definir"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Fecha por definir"
  return date.toLocaleDateString("es-ES")
}

export function formatDateTime(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatMoney(value: number | null | undefined) {
  const amount = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(amount)) return "—"
  if (amount === 0) return "0€"

  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.00$/, "")

  return `${text}€`
}
