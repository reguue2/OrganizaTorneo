export function formatEur(value: number | null | undefined): string {
  const amount = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(amount)) return "—"
  if (amount === 0) return "0€"

  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.00$/, "")

  return `${text}€`
}

export function formatWalletDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
