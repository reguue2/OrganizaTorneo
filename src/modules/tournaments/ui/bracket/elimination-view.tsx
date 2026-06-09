import { Trophy } from "lucide-react"

import type { BracketMatch, BracketRound } from "@/modules/tournaments/domain"
import { cn } from "@/lib/utils"

import { SlotLabel } from "./bracket-slot"

const THIRD_PLACE_ROUND = "Tercer y cuarto puesto"

function MatchCard({ match, highlight = false }: { match: BracketMatch; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "w-44 overflow-hidden rounded-lg border bg-card shadow-sm",
        highlight ? "border-primary/40 bg-primary/5" : "border-border"
      )}
    >
      <div className="flex min-w-0 items-center px-3 py-2">
        <SlotLabel slot={match.slotA} className="text-sm" />
      </div>
      <div className="border-t border-border" />
      <div className="flex min-w-0 items-center px-3 py-2">
        <SlotLabel slot={match.slotB} className="text-sm" />
      </div>
    </div>
  )
}

/**
 * Lines linking a match to the one it feeds in the next round. The columns are
 * sized with `flex-1` wrappers, so a match's vertical centre already lands on
 * the midpoint of its two feeders — these spans just draw the wiring.
 */
function Connectors({ isTop, single }: { isTop: boolean; single: boolean }) {
  return (
    <>
      {/* Horizontal stub out of this match toward the junction. */}
      <span className="absolute left-full top-1/2 h-0.5 w-3.5 -translate-y-1/2 bg-border" />

      {single ? (
        // Final -> champion: a straight line, no pairing.
        <span className="absolute left-[calc(100%_+_0.875rem)] top-1/2 h-0.5 w-3.5 -translate-y-1/2 bg-border" />
      ) : (
        isTop && (
          <>
            {/* Vertical line down to the bottom feeder's centre. */}
            <span className="absolute left-[calc(100%_+_0.875rem)] top-1/2 h-full w-0.5 bg-border" />
            {/* Horizontal stub from the pair midpoint into the next match. */}
            <span className="absolute left-[calc(100%_+_0.875rem)] top-full h-0.5 w-3.5 -translate-y-1/2 bg-border" />
          </>
        )
      )}
    </>
  )
}

function RoundColumn({
  round,
  withConnectors,
}: {
  round: BracketRound
  withConnectors: boolean
}) {
  const single = round.matches.length === 1

  return (
    <div className={cn("flex flex-col", withConnectors && "pr-7")}>
      <h4 className="mb-3 h-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {round.name}
      </h4>
      <div className="flex flex-1 flex-col">
        {round.matches.map((match, index) => (
          <div
            key={match.id}
            className="relative flex min-h-20 flex-1 items-center"
          >
            <MatchCard match={match} />
            {withConnectors && <Connectors isTop={index % 2 === 0} single={single} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChampionColumn() {
  return (
    <div className="flex flex-col">
      <h4 className="mb-3 h-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Campeón
      </h4>
      <div className="flex flex-1 flex-col">
        <div className="relative flex min-h-20 flex-1 items-center">
          <div className="flex w-44 items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 shadow-sm">
            <Trophy className="size-4 shrink-0 text-primary" />
            <span className="min-w-0 truncate text-sm font-medium text-muted-foreground">
              Por definir
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EliminationColumns({ rounds }: { rounds: BracketRound[] }) {
  const mainRounds = rounds.filter((round) => round.name !== THIRD_PLACE_ROUND)
  const thirdPlace = rounds.find((round) => round.name === THIRD_PLACE_ROUND)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch">
          {mainRounds.map((round) => (
            <RoundColumn key={round.name} round={round} withConnectors />
          ))}
          <ChampionColumn />
        </div>
      </div>

      {thirdPlace && thirdPlace.matches[0] && (
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {thirdPlace.name}
          </h4>
          <MatchCard match={thirdPlace.matches[0]} />
        </div>
      )}
    </div>
  )
}
