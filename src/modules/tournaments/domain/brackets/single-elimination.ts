import {
  buildEliminationRounds,
  nextPowerOfTwo,
  participantSlot,
  seedOrder,
} from "./helpers"
import type {
  BracketOptions,
  BracketParticipant,
  BracketSlot,
  SingleEliminationBody,
} from "./types"

export function generateSingleElimination(
  participants: BracketParticipant[],
  options: BracketOptions = {}
): SingleEliminationBody {
  const size = nextPowerOfTwo(Math.max(participants.length, 2))
  const order = seedOrder(size)

  const firstRoundSlots: BracketSlot[] = order.map((seed) => {
    const participant = participants[seed - 1]
    return participant ? participantSlot(participant) : { kind: "bye" }
  })

  return {
    kind: "single_elimination",
    rounds: buildEliminationRounds(firstRoundSlots, "ko", {
      thirdPlace: options.thirdPlace,
    }),
  }
}
