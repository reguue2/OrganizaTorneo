import {
  resolveBracket,
  type BracketStructure,
  type GroupsKnockoutBody,
} from "@/modules/tournaments/domain"

import { EliminationColumns } from "./elimination-view"
import { GroupsKnockoutView } from "./groups-knockout-view"
import { RoundRobinView } from "./round-robin-view"

/** How many advance per group, read from the (unresolved) knockout seeds. */
function groupsQualifiers(body: GroupsKnockoutBody): number {
  let max = 0
  for (const round of body.knockout) {
    for (const match of round.matches) {
      for (const slot of [match.slotA, match.slotB]) {
        if (slot.kind === "placeholder" && slot.source?.type === "group_qualifier") {
          max = Math.max(max, slot.source.position)
        }
      }
    }
  }
  return max
}

export function BracketView({ structure }: { structure: BracketStructure }) {
  const { body, standings, champion } = resolveBracket(structure)

  if (body.kind === "single_elimination") {
    return <EliminationColumns rounds={body.rounds} champion={champion} />
  }

  if (body.kind === "round_robin") {
    return <RoundRobinView rounds={body.rounds} standings={standings[""] ?? []} />
  }

  return (
    <GroupsKnockoutView
      body={body}
      standings={standings}
      champion={champion}
      qualifiersPerGroup={
        structure.body.kind === "groups_knockout" ? groupsQualifiers(structure.body) : 0
      }
    />
  )
}
