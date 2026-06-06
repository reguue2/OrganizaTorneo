import type { BracketStructure } from "@/modules/tournaments/domain"

import { EliminationColumns } from "./elimination-view"
import { GroupsKnockoutView } from "./groups-knockout-view"
import { RoundRobinView } from "./round-robin-view"

export function BracketView({ structure }: { structure: BracketStructure }) {
  const { body } = structure

  if (body.kind === "single_elimination") {
    return <EliminationColumns rounds={body.rounds} />
  }

  if (body.kind === "round_robin") {
    return <RoundRobinView rounds={body.rounds} />
  }

  return <GroupsKnockoutView body={body} />
}
