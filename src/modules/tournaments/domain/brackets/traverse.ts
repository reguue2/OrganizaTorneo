import type { BracketBody, BracketMatch } from "./types"

/** Every match in a bracket body, regardless of format. */
export function getAllMatches(body: BracketBody): BracketMatch[] {
  if (body.kind === "single_elimination" || body.kind === "round_robin") {
    return body.rounds.flatMap((round) => round.matches)
  }
  return [
    ...body.groups.flatMap((group) => group.rounds.flatMap((round) => round.matches)),
    ...body.knockout.flatMap((round) => round.matches),
  ]
}

export function findMatchById(body: BracketBody, id: string): BracketMatch | undefined {
  return getAllMatches(body).find((match) => match.id === id)
}

/**
 * The group a match belongs to in a groups + knockout bracket, or `null` for
 * knockout matches and the other formats. Used to know that editing a group
 * result can reshuffle the knockout seeding.
 */
export function getMatchGroupName(body: BracketBody, id: string): string | null {
  if (body.kind !== "groups_knockout") return null
  for (const group of body.groups) {
    if (group.rounds.some((round) => round.matches.some((match) => match.id === id))) {
      return group.name
    }
  }
  return null
}
