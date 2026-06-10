export type BracketFormat =
  | "single_elimination"
  | "round_robin"
  | "groups_knockout"

export type BracketParticipant = {
  id: string
  name: string
}

/**
 * Where a placeholder slot gets its contender from once results are in. Stored
 * explicitly at generation time so the resolver never has to guess from match
 * positions or parse human labels:
 * - `winner`/`loser`: the winner/loser of an earlier match (knockout feeders,
 *   3rd place match).
 * - `group_qualifier`: the participant that finishes in `position` (1-indexed)
 *   of `group`'s standings (groups + knockout).
 */
export type SlotSource =
  | { type: "winner"; matchId: string }
  | { type: "loser"; matchId: string }
  | { type: "group_qualifier"; group: string; position: number }

/**
 * A single side of a match. It can be a real participant, an empty slot (bye),
 * or a placeholder that will be resolved later (e.g. "Ganador" / "1º Grupo A").
 * Brackets are generated without results, so later rounds use placeholders. The
 * optional `source` lets the resolver fill the placeholder once results exist.
 */
export type BracketSlot =
  | { kind: "participant"; id: string; name: string }
  | { kind: "bye" }
  | { kind: "placeholder"; label: string; source?: SlotSource }

/**
 * The outcome of a played match. `winner` is the side that advances and is the
 * single source of truth for propagation; it is derived from the score, or set
 * explicitly to break a tie that cannot end in a draw (knockout).
 */
export type MatchResult = {
  scoreA: number | null
  scoreB: number | null
  winner: "A" | "B" | null
}

export type BracketMatch = {
  id: string
  slotA: BracketSlot
  slotB: BracketSlot
  result?: MatchResult
}

export type BracketRound = {
  name: string
  matches: BracketMatch[]
}

export type BracketGroup = {
  name: string
  participants: BracketParticipant[]
  rounds: BracketRound[]
}

export type SingleEliminationBody = {
  kind: "single_elimination"
  rounds: BracketRound[]
}

export type RoundRobinBody = {
  kind: "round_robin"
  rounds: BracketRound[]
}

export type GroupsKnockoutBody = {
  kind: "groups_knockout"
  groups: BracketGroup[]
  knockout: BracketRound[]
}

export type BracketBody =
  | SingleEliminationBody
  | RoundRobinBody
  | GroupsKnockoutBody

export type BracketOptions = {
  /** Single elimination: add a 3rd/4th place match. */
  thirdPlace?: boolean
  /** Round robin: home-and-away (ida y vuelta). */
  doubleRound?: boolean
  /** Groups: number of groups. */
  groupCount?: number
  /** Groups: how many advance per group to the knockout phase. */
  qualifiersPerGroup?: number
}

/**
 * The persisted shape of a generated bracket. Versioned so we can evolve it
 * without breaking already generated brackets. v2 adds per-match results and
 * explicit slot `source`s; v1 brackets simply carry no results and the resolver
 * treats them as not-yet-played.
 */
export type BracketStructure = {
  version: 1 | 2
  format: BracketFormat
  options: BracketOptions
  participants: BracketParticipant[]
  body: BracketBody
}

/** One row of a league/group standings table. */
export type Standing = {
  participantId: string
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

/**
 * The render-ready view of a bracket: the same body but with placeholder slots
 * resolved to their real contenders where results allow, plus computed
 * standings (keyed by group name; the single round-robin uses `""`) and the
 * champion once the final is decided.
 */
export type ResolvedBracket = {
  body: BracketBody
  standings: Record<string, Standing[]>
  champion: BracketParticipant | null
}

/** A persisted bracket row, as loaded from `tournament_brackets`. */
export type TournamentBracketRow = {
  id: string
  tournament_id: string
  category_id: string | null
  format: BracketFormat
  structure: BracketStructure
  participant_count: number
  created_at: string
  updated_at: string
}
