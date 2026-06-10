import { describe, expect, it } from "vitest"

import { generateGroupsKnockout } from "./groups-knockout"
import { computeStandings, resolveBracket } from "./resolve"
import { setMatchResult } from "./results"
import { findMatchById } from "./traverse"
import type {
  BracketMatch,
  BracketParticipant,
  BracketStructure,
} from "./types"

function makeParticipants(count: number): BracketParticipant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `P${index + 1}`,
  }))
}

function participantSlot(id: string, name: string): BracketMatch["slotA"] {
  return { kind: "participant", id, name }
}

describe("computeStandings", () => {
  it("counts wins, draws and losses and orders by points then goal difference", () => {
    const participants = makeParticipants(3)
    const matches: BracketMatch[] = [
      {
        id: "m1",
        slotA: participantSlot("1", "P1"),
        slotB: participantSlot("2", "P2"),
        result: { scoreA: 3, scoreB: 1, winner: "A" },
      },
      {
        id: "m2",
        slotA: participantSlot("1", "P1"),
        slotB: participantSlot("3", "P3"),
        result: { scoreA: 2, scoreB: 2, winner: null },
      },
      {
        id: "m3",
        slotA: participantSlot("2", "P2"),
        slotB: participantSlot("3", "P3"),
        result: { scoreA: 0, scoreB: 1, winner: "B" },
      },
    ]

    const table = computeStandings(participants, matches)

    // P1: win + draw = 4 pts (dif +2); P3: draw + win = 4 pts (dif +1); P2: 0 pts.
    expect(table.map((row) => row.name)).toEqual(["P1", "P3", "P2"])
    expect(table[0]).toMatchObject({
      points: 4,
      won: 1,
      drawn: 1,
      lost: 0,
      goalsFor: 5,
      goalsAgainst: 3,
      goalDifference: 2,
    })
    expect(table[2]).toMatchObject({ points: 0, lost: 2 })
  })

  it("ignores matches without a result or without two participants", () => {
    const participants = makeParticipants(2)
    const matches: BracketMatch[] = [
      {
        id: "m1",
        slotA: participantSlot("1", "P1"),
        slotB: participantSlot("2", "P2"),
      },
      {
        id: "m2",
        slotA: participantSlot("1", "P1"),
        slotB: { kind: "bye" },
        result: { scoreA: 1, scoreB: 0, winner: "A" },
      },
    ]

    expect(computeStandings(participants, matches).every((row) => row.played === 0)).toBe(true)
  })
})

describe("resolveBracket (groups + knockout)", () => {
  // Group A: P1,P4,P5,P8 — Group B: P2,P3,P6,P7 (snake distribution of P1..P8).
  function playAllGroupsFavoringLowerNumber(input: BracketStructure): BracketStructure {
    let structure = input
    if (structure.body.kind !== "groups_knockout") return structure
    for (const group of structure.body.groups) {
      for (const round of group.rounds) {
        for (const match of round.matches) {
          if (match.slotA.kind !== "participant" || match.slotB.kind !== "participant") continue
          const aStronger = Number(match.slotA.name.slice(1)) < Number(match.slotB.name.slice(1))
          structure = setMatchResult(
            structure,
            match.id,
            aStronger ? { scoreA: 2, scoreB: 0, winner: "A" } : { scoreA: 0, scoreB: 2, winner: "B" }
          )
        }
      }
    }
    return structure
  }

  function build(): BracketStructure {
    return {
      version: 2,
      format: "groups_knockout",
      options: { groupCount: 2, qualifiersPerGroup: 2 },
      participants: makeParticipants(8),
      body: generateGroupsKnockout(makeParticipants(8), {
        groupCount: 2,
        qualifiersPerGroup: 2,
      }),
    }
  }

  it("keeps knockout slots unresolved until the groups are complete", () => {
    const resolved = resolveBracket(build())
    const semis =
      resolved.body.kind === "groups_knockout"
        ? resolved.body.knockout.find((round) => round.name === "Semifinales")?.matches ?? []
        : []
    const placeholders = semis.flatMap((match) => [match.slotA, match.slotB])
    expect(placeholders.every((slot) => slot.kind === "placeholder")).toBe(true)
  })

  it("seeds the knockout from the final group standings", () => {
    const structure = playAllGroupsFavoringLowerNumber(build())
    const resolved = resolveBracket(structure)
    const semis =
      resolved.body.kind === "groups_knockout"
        ? resolved.body.knockout.find((round) => round.name === "Semifinales")?.matches ?? []
        : []

    // 1º A = P1, 2º A = P4, 1º B = P2, 2º B = P3.
    expect(semis[0].slotA).toMatchObject({ name: "P1" })
    expect(semis[0].slotB).toMatchObject({ name: "P4" })
    expect(semis[1].slotA).toMatchObject({ name: "P2" })
    expect(semis[1].slotB).toMatchObject({ name: "P3" })
  })

  it("crowns the knockout champion and cascades a group change into the knockout", () => {
    let structure = playAllGroupsFavoringLowerNumber(build())
    structure = setMatchResult(structure, "gko-r1-m1", { scoreA: 2, scoreB: 0, winner: "A" }) // P1
    structure = setMatchResult(structure, "gko-r1-m2", { scoreA: 2, scoreB: 0, winner: "A" }) // P2
    structure = setMatchResult(structure, "gko-r2-m1", { scoreA: 2, scoreB: 1, winner: "A" }) // P1
    expect(resolveBracket(structure).champion?.name).toBe("P1")

    // Editing a Group A result can reshuffle the seeding, so knockout matches
    // fed by Group A are cleared; the Group B path survives.
    structure = setMatchResult(structure, "g1-j1-m1", { scoreA: 0, scoreB: 2, winner: "B" })
    expect(findMatchById(structure.body, "gko-r1-m1")?.result).toBeUndefined()
    expect(findMatchById(structure.body, "gko-r2-m1")?.result).toBeUndefined()
    expect(findMatchById(structure.body, "gko-r1-m2")?.result).toBeDefined()
  })
})
