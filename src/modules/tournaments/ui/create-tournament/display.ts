import type { CreateTournamentDraft, ParticipantType } from "./types"

export function getPaymentLabel(
  value: CreateTournamentDraft["payment_method"]
) {
  if (value === "cash") return "Efectivo"
  if (value === "online") return "Online"
  return "Efectivo y online"
}

export function getPrizeModeLabel(value: CreateTournamentDraft["prize_mode"]) {
  if (value === "global") return "Premios globales"
  if (value === "per_category") return "Por categoría"
  return "Sin premios"
}

export function getParticipantTypeLabel(value: ParticipantType | null) {
  if (value === "team") return "Equipos"
  if (value === "individual") return "Individual"
  return "Por definir"
}
