import { describe, expect, it } from "vitest"

import { generateSingleElimination } from "./single-elimination"
import { deriveWinner, normalizeMatchResult, setMatchResult } from "./results"
import { resolveBracket } from "./resolve"
import { findMatchById } from "./traverse"
import type { BracketParticipant, BracketStructure, MatchResult } from "./types"

function makeParticipants(count: number): BracketParticipant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `P${index + 1}`,
  }))
}

function singleElimination(
  count: number,
  options: { thirdPlace?: boolean } = {}
): BracketStructure {
  return {
    version: 2,
    format: "single_elimination",
    options,
    participants: makeParticipants(count),
    body: generateSingleElimination(makeParticipants(count), options),
  }
}

function win(scoreA: number, scoreB: number): MatchResult {
  return { scoreA, scoreB, winner: deriveWinner(scoreA, scoreB) }
}

describe("deriveWinner", () => {
  it("picks the higher score and returns null for ties or missing scores", () => {
    expect(deriveWinner(3, 1)).toBe("A")
    expect(deriveWinner(1, 3)).toBe("B")
    expect(deriveWinner(2, 2)).toBeNull()
    expect(deriveWinner(null, 2)).toBeNull()
  })
})

describe("normalizeMatchResult", () => {
  it("re-derives the winner from the score, ignoring an inconsistent input", () => {
    expect(normalizeMatchResult({ scoreA: 5, scoreB: 1, winner: "B" }).winner).toBe("A")
  })

  it("keeps the explicit winner on a tie (manual pick)", () => {
    expect(normalizeMatchResult({ scoreA: 2, scoreB: 2, winner: "B" }).winner).toBe("B")
  })
})

describe("setMatchResult + resolveBracket (single elimination)", () => {
  it("advances winners into the next round", () => {
    // 4 players: ko-r1-m1 = P1 vs P4, ko-r1-m2 = P2 vs P3, ko-r2-m1 = Final.
    let structure = singleElimination(4)
    structure = setMatchResult(structure, "ko-r1-m1", win(2, 1)) // P1
    structure = setMatchResult(structure, "ko-r1-m2", win(0, 3)) // P3

    const resolved = resolveBracket(structure)
    const final = resolved.body.kind === "single_elimination"
      ? resolved.body.rounds.find((round) => round.name === "Final")?.matches[0]
      : undefined

    expect(final?.slotA).toMatchObject({ kind: "participant", name: "P1" })
    expect(final?.slotB).toMatchObject({ kind: "participant", name: "P3" })
  })

  it("names the champion once the final is decided", () => {
    let structure = singleElimination(4)
    structure = setMatchResult(structure, "ko-r1-m1", win(2, 1)) // P1
    structure = setMatchResult(structure, "ko-r1-m2", win(0, 3)) // P3
    structure = setMatchResult(structure, "ko-r2-m1", win(5, 2)) // final winner is slot A

    expect(resolveBracket(structure).champion?.name).toBe("P1")
  })

  it("fills the third place match from the semifinal losers", () => {
    let structure = singleElimination(4, { thirdPlace: true })
    structure = setMatchResult(structure, "ko-r1-m1", win(2, 1)) // P1 beats P4
    structure = setMatchResult(structure, "ko-r1-m2", win(2, 3)) // P3 beats P2

    const resolved = resolveBracket(structure)
    const third = resolved.body.kind === "single_elimination"
      ? resolved.body.rounds.find((round) => round.name === "Tercer y cuarto puesto")?.matches[0]
      : undefined

    expect(third?.slotA).toMatchObject({ name: "P4" })
    expect(third?.slotB).toMatchObject({ name: "P2" })
  })

  it("clears downstream results when an earlier winner changes", () => {
    let structure = singleElimination(4)
    structure = setMatchResult(structure, "ko-r1-m1", win(2, 1)) // P1
    structure = setMatchResult(structure, "ko-r1-m2", win(0, 3)) // P3
    structure = setMatchResult(structure, "ko-r2-m1", win(5, 2)) // P1 champion
    expect(resolveBracket(structure).champion?.name).toBe("P1")

    // Flip the first semifinal: P4 now advances, so the final result is stale.
    structure = setMatchResult(structure, "ko-r1-m1", win(1, 2)) // P4

    expect(findMatchById(structure.body, "ko-r2-m1")?.result).toBeUndefined()
    expect(findMatchById(structure.body, "ko-r1-m2")?.result).toBeDefined()

    const resolved = resolveBracket(structure)
    expect(resolved.champion).toBeNull()
    const final = resolved.body.kind === "single_elimination"
      ? resolved.body.rounds.find((round) => round.name === "Final")?.matches[0]
      : undefined
    expect(final?.slotA).toMatchObject({ name: "P4" })
  })

  it("throws for an unknown match id", () => {
    expect(() => setMatchResult(singleElimination(4), "nope", win(1, 0))).toThrow()
  })
})
