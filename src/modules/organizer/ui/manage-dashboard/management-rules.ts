import type {
  CategoryRow,
  RegistrationRow,
  RegistrationStatus,
  TournamentRow,
} from "@/modules/organizer/domain"
import {
  ACTIVE_REGISTRATION_STATUSES,
  CANCELLABLE_BY_ORGANIZER_STATUSES,
  CONFIRMABLE_ONLINE_STATUSES,
  PENDING_MANUAL_REVIEW_STATUSES,
} from "@/modules/organizer/domain"

import type { RegistrationView } from "./types"

export function getRegistrationAmount(
  registration: RegistrationRow,
  tournament: TournamentRow,
  category: CategoryRow | null
) {
  if (registration.category_id) return Number(category?.price ?? 0)
  return Number(tournament.entry_price ?? 0)
}

export function getCapacityForTournament(
  tournament: TournamentRow,
  categories: CategoryRow[]
) {
  if (!tournament.has_categories) return tournament.max_participants
  if (categories.length === 0) return null
  if (categories.some((category) => category.max_participants === null)) return null

  return categories.reduce(
    (acc, category) => acc + (category.max_participants ?? 0),
    0
  )
}

export function canReopenTournament(tournament: TournamentRow) {
  if (tournament.status !== "closed") return false
  if (!tournament.registration_deadline) return true

  const deadline = new Date(tournament.registration_deadline)
  if (Number.isNaN(deadline.getTime())) return true

  return deadline > new Date()
}

export function canEditTournamentConfig(tournament: TournamentRow) {
  return tournament.status === "published" || tournament.status === "closed"
}

export function isActiveRegistration(status: RegistrationStatus | null) {
  if (!status) return false
  return ACTIVE_REGISTRATION_STATUSES.includes(status)
}

export function isConfirmedRegistration(status: RegistrationStatus | null) {
  return status === "confirmed"
}

export function areRegistrationsClosed(tournament: TournamentRow) {
  return tournament.status === "closed" || tournament.status === "finished"
}

export function hasTournamentStarted(tournament: TournamentRow) {
  if (!tournament.date) return false

  const date = new Date(tournament.date)
  if (Number.isNaN(date.getTime())) return false

  return date <= new Date()
}

export function needsCashValidation(
  view: RegistrationView,
  tournament: TournamentRow
) {
  if (tournament.status !== "published" && tournament.status !== "closed") {
    return false
  }

  if (hasTournamentStarted(tournament)) {
    return false
  }

  return (
    view.registration.payment_method === "cash" &&
    view.registration.status !== null &&
    PENDING_MANUAL_REVIEW_STATUSES.includes(view.registration.status)
  )
}

export function needsOnlineValidation(
  view: RegistrationView,
  tournament: TournamentRow
) {
  if (tournament.status !== "published" && tournament.status !== "closed") {
    return false
  }

  if (hasTournamentStarted(tournament)) {
    return false
  }

  return (
    view.registration.payment_method === "online" &&
    view.registration.status !== null &&
    CONFIRMABLE_ONLINE_STATUSES.includes(view.registration.status)
  )
}

export function canCancelFromDashboard(
  status: RegistrationStatus | null,
  tournament: TournamentRow
) {
  if (!status) return false
  if (!CANCELLABLE_BY_ORGANIZER_STATUSES.includes(status)) return false
  if (tournament.status === "finished" || tournament.status === "cancelled") {
    return false
  }
  if (hasTournamentStarted(tournament)) return false
  return true
}
