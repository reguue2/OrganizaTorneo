import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type { PublicTournamentStatusState } from "@/modules/tournaments/domain"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const publicTournamentStatusVariant = {
  open: "success",
  closed: "warning",
  finished: "secondary",
  cancelled: "destructive",
} satisfies Record<PublicTournamentStatusState, BadgeVariant>

export function getPublicTournamentStatusVariant(
  state: PublicTournamentStatusState
) {
  return publicTournamentStatusVariant[state]
}
