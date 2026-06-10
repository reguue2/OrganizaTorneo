import { generateGroupsKnockout } from "./groups-knockout"
import { shuffle } from "./helpers"
import { generateRoundRobin } from "./round-robin"
import { generateSingleElimination } from "./single-elimination"
import type {
  BracketBody,
  BracketFormat,
  BracketOptions,
  BracketParticipant,
  BracketStructure,
} from "./types"

export function buildBracketBody(
  format: BracketFormat,
  participants: BracketParticipant[],
  options: BracketOptions
): BracketBody {
  switch (format) {
    case "single_elimination":
      return generateSingleElimination(participants, options)
    case "round_robin":
      return generateRoundRobin(participants, options)
    case "groups_knockout":
      return generateGroupsKnockout(participants, options)
  }
}

/**
 * Generates the full, persistable bracket structure. Participants are shuffled
 * (random seeding) and snapshotted into the structure so the public view can
 * render names without reading the `participants` table.
 */
export function buildBracketStructure({
  format,
  options = {},
  participants,
  rng,
}: {
  format: BracketFormat
  options?: BracketOptions
  participants: BracketParticipant[]
  rng?: () => number
}): BracketStructure {
  const seeded = shuffle(participants, rng)

  return {
    version: 2,
    format,
    options,
    participants: seeded,
    body: buildBracketBody(format, seeded, options),
  }
}
