import type { BracketParticipant, BracketRound, BracketSlot } from "./types"

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

export function nextPowerOfTwo(value: number): number {
  let power = 1
  while (power < value) power *= 2
  return power
}

/**
 * Standard single-elimination seeding order for a bracket of `size` slots
 * (a power of two). Returns the 1-indexed seed that belongs in each slot, so
 * top seeds are spread apart and byes (missing high seeds) don't cluster.
 */
export function seedOrder(size: number): number[] {
  let seeds = [1, 2]
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1
    const next: number[] = []
    for (const seed of seeds) {
      next.push(seed)
      next.push(sum - seed)
    }
    seeds = next
  }
  return seeds
}

export function roundNameForSlots(slotCount: number): string {
  switch (slotCount) {
    case 2:
      return "Final"
    case 4:
      return "Semifinales"
    case 8:
      return "Cuartos de final"
    case 16:
      return "Octavos de final"
    case 32:
      return "Dieciseisavos de final"
    default:
      return `Ronda de ${slotCount}`
  }
}

export function participantSlot(participant: BracketParticipant): BracketSlot {
  return { kind: "participant", id: participant.id, name: participant.name }
}

export function groupLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

/**
 * Builds every round of a single-elimination bracket from the slots of the
 * first round (length must be a power of two). The first round keeps the real
 * slots; later rounds use "Por definir" placeholders (no results in v1).
 */
export function buildEliminationRounds(
  firstRoundSlots: BracketSlot[],
  idPrefix: string,
  options: { thirdPlace?: boolean } = {}
): BracketRound[] {
  const size = firstRoundSlots.length
  const rounds: BracketRound[] = []

  const firstMatches = []
  for (let i = 0; i < size / 2; i += 1) {
    firstMatches.push({
      id: `${idPrefix}-r1-m${i + 1}`,
      slotA: firstRoundSlots[i * 2],
      slotB: firstRoundSlots[i * 2 + 1],
    })
  }
  rounds.push({ name: roundNameForSlots(size), matches: firstMatches })

  let roundIndex = 2
  let matchCount = size / 4
  while (matchCount >= 1) {
    const matches = []
    for (let i = 0; i < matchCount; i += 1) {
      matches.push({
        id: `${idPrefix}-r${roundIndex}-m${i + 1}`,
        slotA: { kind: "placeholder", label: "Por definir" } as BracketSlot,
        slotB: { kind: "placeholder", label: "Por definir" } as BracketSlot,
      })
    }
    rounds.push({ name: roundNameForSlots(matchCount * 2), matches })
    roundIndex += 1
    matchCount /= 2
  }

  if (options.thirdPlace && size >= 4) {
    rounds.push({
      name: "Tercer y cuarto puesto",
      matches: [
        {
          id: `${idPrefix}-third`,
          slotA: { kind: "placeholder", label: "Perdedor semifinal 1" },
          slotB: { kind: "placeholder", label: "Perdedor semifinal 2" },
        },
      ],
    })
  }

  return rounds
}

/**
 * Round-robin pairings via the circle method. Returns one array per round;
 * each round is a list of index pairs into the participant array. `null` means
 * the participant rests that round (odd number of participants).
 */
export function circlePairings(count: number): Array<Array<[number, number | null]>> {
  const hasBye = count % 2 !== 0
  const size = hasBye ? count + 1 : count
  const byeIndex = count
  const roundsCount = size - 1
  const half = size / 2

  let order = Array.from({ length: size }, (_, index) => index)
  const rounds: Array<Array<[number, number | null]>> = []

  for (let round = 0; round < roundsCount; round += 1) {
    const pairs: Array<[number, number | null]> = []
    for (let i = 0; i < half; i += 1) {
      const a = order[i]
      const b = order[size - 1 - i]
      const aIsBye = hasBye && a === byeIndex
      const bIsBye = hasBye && b === byeIndex
      if (aIsBye) pairs.push([b, null])
      else if (bIsBye) pairs.push([a, null])
      else pairs.push([a, b])
    }
    rounds.push(pairs)

    const fixed = order[0]
    const rest = order.slice(1)
    const last = rest.pop() as number
    order = [fixed, last, ...rest]
  }

  return rounds
}

export function buildRoundRobinRounds(
  participants: BracketParticipant[],
  idPrefix: string,
  options: { doubleRound?: boolean } = {}
): BracketRound[] {
  const pairings = circlePairings(participants.length)
  const part = (index: number): BracketSlot => participantSlot(participants[index])

  const firstLeg: BracketRound[] = pairings.map((pairs, round) => ({
    name: `Jornada ${round + 1}`,
    matches: pairs.map(([a, b], i) => ({
      id: `${idPrefix}-j${round + 1}-m${i + 1}`,
      slotA: part(a),
      slotB: b === null ? { kind: "bye" } : part(b),
    })),
  }))

  if (!options.doubleRound) return firstLeg

  const offset = firstLeg.length
  const secondLeg: BracketRound[] = pairings.map((pairs, round) => ({
    name: `Jornada ${offset + round + 1}`,
    matches: pairs.map(([a, b], i) => ({
      id: `${idPrefix}-j${offset + round + 1}-m${i + 1}`,
      slotA: b === null ? part(a) : part(b),
      slotB: b === null ? { kind: "bye" } : part(a),
    })),
  }))

  return [...firstLeg, ...secondLeg]
}
