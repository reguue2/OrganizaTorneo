export type BracketFormat =
  | "single_elimination"
  | "round_robin"
  | "groups_knockout"

export type BracketParticipant = {
  id: string
  name: string
}

/**
 * A single side of a match. It can be a real participant, an empty slot (bye),
 * or a placeholder that will be resolved later (e.g. "Ganador" / "1º Grupo A").
 * Brackets are generated without results, so later rounds use placeholders.
 */
export type BracketSlot =
  | { kind: "participant"; id: string; name: string }
  | { kind: "bye" }
  | { kind: "placeholder"; label: string }

export type BracketMatch = {
  id: string
  slotA: BracketSlot
  slotB: BracketSlot
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
 * (e.g. add results) without breaking already generated brackets.
 */
export type BracketStructure = {
  version: 1
  format: BracketFormat
  options: BracketOptions
  participants: BracketParticipant[]
  body: BracketBody
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
