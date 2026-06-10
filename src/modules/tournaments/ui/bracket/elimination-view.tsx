"use client"

import { Pencil, Trophy } from "lucide-react"

import type {
  BracketMatch,
  BracketParticipant,
  BracketRound,
  MatchResult,
} from "@/modules/tournaments/domain"
import { cn } from "@/lib/utils"

import { useBracketResults } from "./bracket-results-context"
import { SlotLabel } from "./bracket-slot"

const THIRD_PLACE_ROUND = "Tercer y cuarto puesto"

function scoreText(result: MatchResult | undefined, side: "A" | "B"): string | null {
  if (!result) return null
  const score = side === "A" ? result.scoreA : result.scoreB
  return score === null ? null : String(score)
}

function SlotScoreRow({
  slot,
  result,
  side,
}: {
  slot: BracketMatch["slotA"]
  result: MatchResult | undefined
  side: "A" | "B"
}) {
  const isWinner = Boolean(result && result.winner === side)
  const score = scoreText(result, side)

  return (
    <div className={cn("flex min-w-0 items-center gap-2 px-3 py-2", isWinner && "bg-primary/5")}>
      <SlotLabel
        slot={slot}
        className={cn(
          "flex-1 text-sm",
          isWinner && "font-semibold text-foreground",
          result && !isWinner && "text-muted-foreground"
        )}
      />
      {score !== null && (
        <span
          className={cn(
            "shrink-0 text-sm tabular-nums",
            isWinner ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {score}
        </span>
      )}
    </div>
  )
}

function MatchCard({ match }: { match: BracketMatch }) {
  const { canEdit, savingMatchId, requestEdit } = useBracketResults()

  const editable =
    canEdit && match.slotA.kind === "participant" && match.slotB.kind === "participant"
  const saving = savingMatchId === match.id

  const card = (
    <>
      <SlotScoreRow slot={match.slotA} result={match.result} side="A" />
      <div className="border-t border-border" />
      <SlotScoreRow slot={match.slotB} result={match.result} side="B" />
    </>
  )

  if (!editable) {
    return (
      <div className="w-44 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {card}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => requestEdit(match, false)}
      title="Registrar resultado"
      className={cn(
        "group relative block w-44 overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-colors hover:border-primary/50",
        saving && "opacity-70"
      )}
    >
      {card}
      <span className="absolute right-1 top-1 rounded bg-card/90 p-0.5 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Pencil className="size-3" />
      </span>
    </button>
  )
}

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
      <div className="flex flex-1 flex-col">
        {round.matches.map((match, index) => (
          <div key={match.id} className="relative flex min-h-20 flex-1 items-center">
            <MatchCard match={match} />
            {withConnectors && <Connectors isTop={index % 2 === 0} single={single} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChampionColumn({ champion }: { champion: BracketParticipant | null }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-1 flex-col">
        <div className="relative flex min-h-20 flex-1 items-center">
          <div
            className={cn(
              "flex w-44 items-center gap-2 rounded-lg border px-3 py-2 shadow-sm",
              champion ? "border-primary bg-primary/10" : "border-primary/40 bg-primary/5"
            )}
          >
            <Trophy className="size-4 shrink-0 text-primary" />
            <span
              className={cn(
                "min-w-0 truncate text-sm font-medium",
                champion ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {champion ? champion.name : "Por definir"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EliminationColumns({
  rounds,
  champion = null,
}: {
  rounds: BracketRound[]
  champion?: BracketParticipant | null
}) {
  const mainRounds = rounds.filter((round) => round.name !== THIRD_PLACE_ROUND)
  const thirdPlace = rounds.find((round) => round.name === THIRD_PLACE_ROUND)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max items-stretch">
          {mainRounds.map((round) => (
            <RoundColumn key={round.name} round={round} withConnectors />
          ))}
          <ChampionColumn champion={champion} />
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
