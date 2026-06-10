"use client"

import type { BracketMatch, BracketRound, Standing } from "@/modules/tournaments/domain"
import { cn } from "@/lib/utils"

import { useBracketResults } from "./bracket-results-context"
import { SlotLabel } from "./bracket-slot"
import { StandingsTable } from "./standings-table"

function sideClass(match: BracketMatch, side: "A" | "B"): string | undefined {
  const winner = match.result?.winner
  if (winner === side) return "font-semibold text-foreground"
  if (match.result && winner && winner !== side) return "text-muted-foreground"
  return undefined
}

function FixtureRow({ match }: { match: BracketMatch }) {
  const { canEdit, savingMatchId, requestEdit } = useBracketResults()

  if (match.slotB.kind === "bye") {
    return (
      <li className="flex items-center gap-2 text-sm">
        <SlotLabel slot={match.slotA} />
        <span className="shrink-0 text-xs text-muted-foreground">descansa</span>
      </li>
    )
  }

  const editable =
    canEdit && match.slotA.kind === "participant" && match.slotB.kind === "participant"
  const saving = savingMatchId === match.id

  const result = match.result
  const middle = result ? `${result.scoreA ?? 0} - ${result.scoreB ?? 0}` : "vs"

  const row = (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <SlotLabel slot={match.slotA} className={cn("text-right", sideClass(match, "A"))} />
      <span
        className={cn(
          "shrink-0 text-xs tabular-nums",
          result ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {middle}
      </span>
      <SlotLabel slot={match.slotB} className={cn("text-left", sideClass(match, "B"))} />
    </div>
  )

  if (!editable) {
    return <li>{row}</li>
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => requestEdit(match, true)}
        title="Registrar resultado"
        className={cn(
          "w-full rounded-md px-1 py-1 text-left transition-colors hover:bg-muted",
          saving && "opacity-70"
        )}
      >
        {row}
      </button>
    </li>
  )
}

export function FixtureCard({ round }: { round: BracketRound }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {round.name}
      </h4>
      <ul className="mt-2 space-y-1">
        {round.matches.map((match) => (
          <FixtureRow key={match.id} match={match} />
        ))}
      </ul>
    </div>
  )
}

export function RoundRobinView({
  rounds,
  standings,
}: {
  rounds: BracketRound[]
  standings: Standing[]
}) {
  return (
    <div className="space-y-5">
      {standings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Clasificación</h3>
          <StandingsTable standings={standings} />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Calendario</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rounds.map((round) => (
            <FixtureCard key={round.name} round={round} />
          ))}
        </div>
      </div>
    </div>
  )
}
