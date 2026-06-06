import type { BracketMatch, BracketRound } from "@/modules/tournaments/domain"

import { SlotLabel } from "./bracket-slot"

function FixtureRow({ match }: { match: BracketMatch }) {
  if (match.slotB.kind === "bye") {
    return (
      <li className="flex items-center gap-2 text-sm">
        <SlotLabel slot={match.slotA} />
        <span className="shrink-0 text-xs text-muted-foreground">descansa</span>
      </li>
    )
  }

  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <SlotLabel slot={match.slotA} className="justify-self-end text-right" />
      <span className="shrink-0 text-xs text-muted-foreground">vs</span>
      <SlotLabel slot={match.slotB} className="justify-self-start text-left" />
    </li>
  )
}

export function FixtureCard({ round }: { round: BracketRound }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {round.name}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {round.matches.map((match) => (
          <FixtureRow key={match.id} match={match} />
        ))}
      </ul>
    </div>
  )
}

export function RoundRobinView({ rounds }: { rounds: BracketRound[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {rounds.map((round) => (
        <FixtureCard key={round.name} round={round} />
      ))}
    </div>
  )
}
