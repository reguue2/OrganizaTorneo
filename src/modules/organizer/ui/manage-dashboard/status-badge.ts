import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import {
  getOrganizerTournamentOperationalState,
  type OrganizerTournamentOperationalState,
  type TournamentRow,
} from "@/modules/organizer/domain"

import type { RegistrationView } from "./types"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const tournamentStatusVariant = {
  unpublished: "outline",
  registrations_open: "success",
  registrations_closed: "warning",
  finished: "info",
  cancelled: "destructive",
} satisfies Record<OrganizerTournamentOperationalState, BadgeVariant>

export function getTournamentStatusVariant(
  tournament: Pick<TournamentRow, "date" | "registration_deadline" | "status">
) {
  return tournamentStatusVariant[getOrganizerTournamentOperationalState(tournament)]
}

export function getRegistrationStatusVariant(view: RegistrationView) {
  if (view.registration.status === "confirmed") {
    return "success"
  }

  if (view.registration.status === "pending_cash_validation") {
    return "warning"
  }

  if (view.registration.status === "pending_online_payment") {
    return "info"
  }

  if (view.registration.status === "cancelled") {
    return "destructive"
  }

  return "outline"
}
