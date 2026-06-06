import { describe, expect, it } from "vitest"

import { buildBracketStructure } from "./generate"
import { generateGroupsKnockout } from "./groups-knockout"
import { generateRoundRobin } from "./round-robin"
import { generateSingleElimination } from "./single-elimination"
import type { BracketMatch, BracketParticipant, BracketSlot } from "./types"

function makeParticipants(count: number): BracketParticipant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `P${index + 1}`,
  }))
}

function countByes(matches: BracketMatch[]): number {
  const isBye = (slot: BracketSlot) => slot.kind === "bye"
  return matches.reduce(
    (total, match) => total + (isBye(match.slotA) ? 1 : 0) + (isBye(match.slotB) ? 1 : 0),
    0
  )
}

describe("generateSingleElimination", () => {
  it("builds a full power-of-two bracket with no byes", () => {
    const body = generateSingleElimination(makeParticipants(8))
    expect(body.rounds.map((round) => round.name)).toEqual([
      "Cuartos de final",
      "Semifinales",
      "Final",
    ])
    expect(body.rounds[0].matches).toHaveLength(4)
    expect(countByes(body.rounds[0].matches)).toBe(0)
  })

  it("adds byes when the count is not a power of two", () => {
    const body = generateSingleElimination(makeParticipants(5))
    // 5 participants -> bracket of 8 -> 3 byes in the first round.
    expect(body.rounds[0].matches).toHaveLength(4)
    expect(countByes(body.rounds[0].matches)).toBe(3)
  })

  it("appends a third place match when requested", () => {
    const body = generateSingleElimination(makeParticipants(4), { thirdPlace: true })
    expect(body.rounds.at(-1)?.name).toBe("Tercer y cuarto puesto")
  })
})

describe("generateRoundRobin", () => {
  it("creates n-1 rounds for an even number of participants", () => {
    const body = generateRoundRobin(makeParticipants(4))
    expect(body.rounds).toHaveLength(3)
    body.rounds.forEach((round) => expect(round.matches).toHaveLength(2))
  })

  it("gives each participant a rest round when the count is odd", () => {
    const body = generateRoundRobin(makeParticipants(5))
    expect(body.rounds).toHaveLength(5)
    const restRounds = body.rounds.filter((round) =>
      round.matches.some((match) => match.slotB.kind === "bye")
    )
    expect(restRounds).toHaveLength(5)
  })

  it("doubles the rounds for home-and-away", () => {
    const body = generateRoundRobin(makeParticipants(4), { doubleRound: true })
    expect(body.rounds).toHaveLength(6)
  })
})

describe("generateGroupsKnockout", () => {
  it("splits participants into balanced groups and builds the knockout", () => {
    const body = generateGroupsKnockout(makeParticipants(8), {
      groupCount: 2,
      qualifiersPerGroup: 2,
    })
    expect(body.groups).toHaveLength(2)
    expect(body.groups[0].participants).toHaveLength(4)
    expect(body.groups[1].participants).toHaveLength(4)
    // 2 groups x 2 qualifiers = 4 entrants -> semifinals + final.
    expect(body.knockout.map((round) => round.name)).toEqual(["Semifinales", "Final"])
  })
})

describe("buildBracketStructure", () => {
  it("snapshots every participant and tags the version/format", () => {
    const structure = buildBracketStructure({
      format: "single_elimination",
      participants: makeParticipants(6),
      rng: () => 0,
    })
    expect(structure.version).toBe(1)
    expect(structure.format).toBe("single_elimination")
    expect(structure.participants).toHaveLength(6)
    expect(structure.body.kind).toBe("single_elimination")
  })
})
