import type {
  BracketParticipant,
  GroupsKnockoutBody,
  Standing,
} from "@/modules/tournaments/domain"

import { EliminationColumns } from "./elimination-view"
import { FixtureCard } from "./round-robin-view"
import { StandingsTable } from "./standings-table"

export function GroupsKnockoutView({
  body,
  standings,
  champion = null,
  qualifiersPerGroup = 0,
}: {
  body: GroupsKnockoutBody
  standings: Record<string, Standing[]>
  champion?: BracketParticipant | null
  qualifiersPerGroup?: number
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {body.groups.map((group) => (
          <div key={group.name} className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="font-semibold text-foreground">{group.name}</h3>

            <StandingsTable
              standings={standings[group.name] ?? []}
              qualifiers={qualifiersPerGroup}
            />

            {group.rounds.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Calendario
                </p>
                <div className="space-y-2">
                  {group.rounds.map((round) => (
                    <FixtureCard key={round.name} round={round} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {body.knockout.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Fase final</h3>
          <EliminationColumns rounds={body.knockout} champion={champion} />
        </div>
      )}
    </div>
  )
}
