import { findMatchById } from "./traverse"
import type {
  BracketBody,
  BracketGroup,
  BracketMatch,
  BracketParticipant,
  BracketRound,
  BracketSlot,
  BracketStructure,
  ResolvedBracket,
  Standing,
} from "./types"

const THIRD_PLACE_ROUND = "Tercer y cuarto puesto"

/** Points awarded in league/group standings. Generic football-style default. */
export const DEFAULT_POINTS = { win: 3, draw: 1, loss: 0 } as const

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function winningSlot(match: BracketMatch): BracketSlot | null {
  const winner = match.result?.winner
  if (!winner) return null
  return winner === "A" ? match.slotA : match.slotB
}

function losingSlot(match: BracketMatch): BracketSlot | null {
  const winner = match.result?.winner
  if (!winner) return null
  return winner === "A" ? match.slotB : match.slotA
}

/** A group is settled once every real (two-contender) match has a result. */
function isGroupComplete(group: BracketGroup): boolean {
  return group.rounds.every((round) =>
    round.matches.every(
      (match) =>
        match.slotA.kind !== "participant" ||
        match.slotB.kind !== "participant" ||
        Boolean(match.result)
    )
  )
}

/**
 * Resolves a placeholder slot to its real contender when the result it depends
 * on is in. Reads the (already resolved) feeder match from `body`, so callers
 * must resolve rounds in dependency order. Group qualifiers only resolve once
 * the group is complete; other unresolved sources keep the placeholder so the
 * view still shows "Por definir".
 */
function resolveSlot(
  slot: BracketSlot,
  body: BracketBody,
  standings: Record<string, Standing[]>,
  completeGroups: Set<string>
): BracketSlot {
  if (slot.kind !== "placeholder" || !slot.source) return slot
  const source = slot.source

  if (source.type === "winner" || source.type === "loser") {
    const feeder = findMatchById(body, source.matchId)
    if (!feeder) return slot
    const resolved = source.type === "winner" ? winningSlot(feeder) : losingSlot(feeder)
    return resolved && resolved.kind === "participant" ? resolved : slot
  }

  if (!completeGroups.has(source.group)) return slot
  const row = standings[source.group]?.[source.position - 1]
  if (!row) return slot
  return { kind: "participant", id: row.participantId, name: row.name }
}

function resolveRoundsInOrder(
  rounds: BracketRound[],
  body: BracketBody,
  standings: Record<string, Standing[]>,
  completeGroups: Set<string>
): void {
  for (const round of rounds) {
    for (const match of round.matches) {
      match.slotA = resolveSlot(match.slotA, body, standings, completeGroups)
      match.slotB = resolveSlot(match.slotB, body, standings, completeGroups)
    }
  }
}

function championOf(rounds: BracketRound[]): BracketParticipant | null {
  const main = rounds.filter((round) => round.name !== THIRD_PLACE_ROUND)
  const final = main[main.length - 1]
  if (!final || final.matches.length !== 1) return null
  const winner = winningSlot(final.matches[0])
  return winner && winner.kind === "participant"
    ? { id: winner.id, name: winner.name }
    : null
}

/**
 * Standings for a set of matches. Only played matches (those with a result and
 * two real participants) count. Sorted by points, then goal difference, then
 * goals for, then name.
 */
export function computeStandings(
  participants: BracketParticipant[],
  matches: BracketMatch[]
): Standing[] {
  const rows = new Map<string, Standing>()
  for (const participant of participants) {
    rows.set(participant.id, {
      participantId: participant.id,
      name: participant.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    })
  }

  for (const match of matches) {
    if (match.slotA.kind !== "participant" || match.slotB.kind !== "participant") continue
    if (!match.result) continue
    const a = rows.get(match.slotA.id)
    const b = rows.get(match.slotB.id)
    if (!a || !b) continue

    const scoreA = match.result.scoreA ?? 0
    const scoreB = match.result.scoreB ?? 0
    a.played += 1
    b.played += 1
    a.goalsFor += scoreA
    a.goalsAgainst += scoreB
    b.goalsFor += scoreB
    b.goalsAgainst += scoreA

    const winner = match.result.winner
    if (winner === "A") {
      a.won += 1
      b.lost += 1
      a.points += DEFAULT_POINTS.win
      b.points += DEFAULT_POINTS.loss
    } else if (winner === "B") {
      b.won += 1
      a.lost += 1
      b.points += DEFAULT_POINTS.win
      a.points += DEFAULT_POINTS.loss
    } else {
      a.drawn += 1
      b.drawn += 1
      a.points += DEFAULT_POINTS.draw
      b.points += DEFAULT_POINTS.draw
    }
  }

  const standings = [...rows.values()]
  for (const row of standings) {
    row.goalDifference = row.goalsFor - row.goalsAgainst
  }
  standings.sort(
    (x, y) =>
      y.points - x.points ||
      y.goalDifference - x.goalDifference ||
      y.goalsFor - x.goalsFor ||
      x.name.localeCompare(y.name)
  )
  return standings
}

/**
 * Render-ready view of a bracket: placeholder slots filled in from results,
 * computed standings (keyed by group name; the single round-robin uses `""`),
 * and the champion once the final is decided.
 */
export function resolveBracket(structure: BracketStructure): ResolvedBracket {
  const body = clone(structure.body)
  const standings: Record<string, Standing[]> = {}

  if (body.kind === "round_robin") {
    standings[""] = computeStandings(
      structure.participants,
      body.rounds.flatMap((round) => round.matches)
    )
    return { body, standings, champion: null }
  }

  if (body.kind === "single_elimination") {
    resolveRoundsInOrder(body.rounds, body, standings, new Set())
    return { body, standings, champion: championOf(body.rounds) }
  }

  const completeGroups = new Set<string>()
  for (const group of body.groups) {
    standings[group.name] = computeStandings(
      group.participants,
      group.rounds.flatMap((round) => round.matches)
    )
    if (isGroupComplete(group)) completeGroups.add(group.name)
  }
  resolveRoundsInOrder(body.knockout, body, standings, completeGroups)
  return { body, standings, champion: championOf(body.knockout) }
}
