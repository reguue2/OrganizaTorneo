import type { BracketMatch, BracketRound } from "@/modules/tournaments/domain"

import { SlotLabel } from "./bracket-slot"

function MatchCard({ match }: { match: BracketMatch }) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center px-3 py-2">
        <SlotLabel slot={match.slotA} className="text-sm" />
      </div>
      <div className="border-t border-border" />
      <div className="flex items-center px-3 py-2">
        <SlotLabel slot={match.slotB} className="text-sm" />
      </div>
    </div>
  )
}

export function EliminationColumns({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-4 md:gap-6">
        {rounds.map((round) => (
          <div key={round.name} className="flex min-w-[180px] flex-1 flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {round.name}
            </h4>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {round.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
