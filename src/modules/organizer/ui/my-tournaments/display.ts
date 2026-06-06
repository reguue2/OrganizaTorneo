import type { OrganizerTournamentView } from "@/modules/organizer/domain"

export function formatDate(value: string | null) {
  if (!value) return "Fecha por definir"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Fecha por definir"

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getParticipantLine(view: OrganizerTournamentView) {
  if (view.capacity === null) {
    return `${view.registrationsCount} participantes`
  }

  return `${view.registrationsCount}/${view.capacity} participantes`
}
