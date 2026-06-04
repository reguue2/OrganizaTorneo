import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type { TournamentStatus } from "@/modules/organizer/domain"

import type { RegistrationView } from "./types"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const tournamentStatusVariant = {
  draft: "outline",
  published: "success",
  closed: "warning",
  finished: "info",
  cancelled: "destructive",
} satisfies Record<NonNullable<TournamentStatus>, BadgeVariant>

export function getTournamentStatusVariant(status: TournamentStatus | null) {
  if (!status) return "outline"
  return tournamentStatusVariant[status]
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
