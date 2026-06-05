import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type {
  OrganizerTournamentView,
  TournamentStatus,
} from "@/modules/organizer/domain"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]
type RegistrationBadge = {
  label: string
  variant: BadgeVariant
}

const tournamentStatusVariant = {
  draft: "outline",
  published: "success",
  closed: "warning",
  finished: "info",
  cancelled: "destructive",
} satisfies Record<NonNullable<TournamentStatus>, BadgeVariant>

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

export function formatMoney(value: number | null | undefined) {
  const amount = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(amount)) return "—"
  if (amount === 0) return "Gratis"

  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.00$/, "")

  return `${text}€`
}

export function getTournamentStatusVariant(status: TournamentStatus | null): BadgeVariant {
  if (!status) return "outline"
  return tournamentStatusVariant[status]
}

export function getTournamentStatusLabel(status: TournamentStatus | null) {
  if (status === "draft") return "No publicado"
  if (status === "published") return "Publicado"
  if (status === "closed") return "Cerrado"
  if (status === "finished") return "Finalizado"
  if (status === "cancelled") return "Cancelado"
  return "No publicado"
}

export function getRegistrationBadge(
  tournament: Pick<OrganizerTournamentView, "status" | "registration_deadline">
): RegistrationBadge | null {
  if (tournament.status === "closed") {
    return {
      label: "Inscripciones cerradas",
      variant: "warning",
    }
  }

  if (tournament.status !== "published") {
    return null
  }

  const deadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : null

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date()) {
    return {
      label: "Inscripciones cerradas",
      variant: "warning",
    }
  }

  return {
    label: "Inscripciones abiertas",
    variant: "info",
  }
}

export function getParticipantLine(view: OrganizerTournamentView) {
  if (view.capacity === null) {
    return `${view.registrationsCount} participantes · Sin límite`
  }

  return `${view.registrationsCount}/${view.capacity} participantes`
}
