import { findMatchById, getAllMatches, getMatchGroupName } from "./traverse"
import type { BracketBody, BracketStructure, MatchResult } from "./types"

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** The side with the higher score, or `null` for a tie / missing score. */
export function deriveWinner(
  scoreA: number | null,
  scoreB: number | null
): "A" | "B" | null {
  if (scoreA === null || scoreB === null) return null
  if (scoreA > scoreB) return "A"
  if (scoreB > scoreA) return "B"
  return null
}

/**
 * Keeps the stored winner consistent with the score: for a match with two
 * different scores the winner is always re-derived; a tie (a draw, or an
 * elimination tie that needs a manual pick) keeps the explicit winner.
 */
export function normalizeMatchResult(result: MatchResult): MatchResult {
  const derived = deriveWinner(result.scoreA, result.scoreB)
  if (derived) return { ...result, winner: derived }
  return result
}

/**
 * Every match whose contenders depend, directly or transitively, on `matchId`.
 * Knockout feeders are followed through the explicit winner/loser sources; for
 * a group-stage match, the knockout slots seeded from that group are downstream
 * too (its standings — and therefore the seeding — can change).
 */
function collectDownstream(body: BracketBody, matchId: string): Set<string> {
  const forward = new Map<string, string[]>()
  for (const match of getAllMatches(body)) {
    for (const slot of [match.slotA, match.slotB]) {
      if (slot.kind === "placeholder" && slot.source) {
        if (slot.source.type === "winner" || slot.source.type === "loser") {
          const feeder = slot.source.matchId
          forward.set(feeder, [...(forward.get(feeder) ?? []), match.id])
        }
      }
    }
  }

  const downstream = new Set<string>()
  const queue: string[] = [matchId]

  const group = getMatchGroupName(body, matchId)
  if (group) {
    for (const match of getAllMatches(body)) {
      for (const slot of [match.slotA, match.slotB]) {
        if (
          slot.kind === "placeholder" &&
          slot.source?.type === "group_qualifier" &&
          slot.source.group === group &&
          !downstream.has(match.id)
        ) {
          downstream.add(match.id)
          queue.push(match.id)
        }
      }
    }
  }

  while (queue.length > 0) {
    const current = queue.shift() as string
    for (const next of forward.get(current) ?? []) {
      if (!downstream.has(next)) {
        downstream.add(next)
        queue.push(next)
      }
    }
  }

  downstream.delete(matchId)
  return downstream
}

/**
 * Sets (or clears, with `null`) the result of a match and returns a new
 * structure. Any downstream result that is no longer valid — because the
 * winner changed or was cleared — is dropped, so the bracket stays consistent.
 * Pure: safe to run on the client for optimistic updates and on the server to
 * persist.
 */
export function setMatchResult(
  structure: BracketStructure,
  matchId: string,
  result: MatchResult | null
): BracketStructure {
  const next = clone(structure)
  const match = findMatchById(next.body, matchId)
  if (!match) {
    throw new Error(`Bracket match not found: ${matchId}`)
  }

  if (result === null) {
    delete match.result
  } else {
    match.result = normalizeMatchResult(result)
  }

  for (const id of collectDownstream(next.body, matchId)) {
    const downstreamMatch = findMatchById(next.body, id)
    if (downstreamMatch) delete downstreamMatch.result
  }

  return next
}
