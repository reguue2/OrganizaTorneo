import {
  buildEliminationRounds,
  buildRoundRobinRounds,
  groupLetter,
  nextPowerOfTwo,
  seedOrder,
} from "./helpers"
import type {
  BracketGroup,
  BracketOptions,
  BracketParticipant,
  BracketRound,
  BracketSlot,
  GroupsKnockoutBody,
} from "./types"

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function defaultGroupCount(participantCount: number): number {
  const maxGroups = Math.floor(participantCount / 2)
  if (maxGroups < 2) return 1
  // Aim for ~4 participants per group.
  return clamp(Math.round(participantCount / 4), 2, maxGroups)
}

function distributeIntoGroups(
  participants: BracketParticipant[],
  groupCount: number
): BracketParticipant[][] {
  const groups: BracketParticipant[][] = Array.from({ length: groupCount }, () => [])
  participants.forEach((participant, index) => {
    const row = Math.floor(index / groupCount)
    const column = index % groupCount
    // Snake distribution keeps groups balanced.
    const groupIndex = row % 2 === 0 ? column : groupCount - 1 - column
    groups[groupIndex].push(participant)
  })
  return groups
}

function buildKnockoutSkeleton(
  groupNames: string[],
  qualifiersPerGroup: number
): BracketRound[] {
  const ranked: string[] = []
  for (let position = 1; position <= qualifiersPerGroup; position += 1) {
    // Alternate group order per position so 1st and 2nd of the same group
    // are placed on opposite sides of the bracket.
    const order = position % 2 === 1 ? groupNames : [...groupNames].reverse()
    for (const name of order) {
      ranked.push(`${position}º ${name}`)
    }
  }

  const size = nextPowerOfTwo(Math.max(ranked.length, 2))
  const order = seedOrder(size)
  const firstRoundSlots: BracketSlot[] = order.map((seed) => {
    const label = ranked[seed - 1]
    return label ? { kind: "placeholder", label } : { kind: "bye" }
  })

  return buildEliminationRounds(firstRoundSlots, "gko")
}

export function generateGroupsKnockout(
  participants: BracketParticipant[],
  options: BracketOptions = {}
): GroupsKnockoutBody {
  const groupCount = clamp(
    options.groupCount ?? defaultGroupCount(participants.length),
    1,
    Math.max(1, Math.floor(participants.length / 2))
  )

  const distributed = distributeIntoGroups(participants, groupCount)
  const groups: BracketGroup[] = distributed.map((groupParticipants, index) => ({
    name: `Grupo ${groupLetter(index)}`,
    participants: groupParticipants,
    rounds:
      groupParticipants.length >= 2
        ? buildRoundRobinRounds(groupParticipants, `g${index + 1}`)
        : [],
  }))

  const smallestGroup = Math.min(...distributed.map((group) => group.length))
  const qualifiersPerGroup = clamp(
    options.qualifiersPerGroup ?? 2,
    1,
    Math.max(1, smallestGroup)
  )

  return {
    kind: "groups_knockout",
    groups,
    knockout: buildKnockoutSkeleton(
      groups.map((group) => group.name),
      qualifiersPerGroup
    ),
  }
}
