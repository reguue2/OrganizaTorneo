import { buildRoundRobinRounds } from "./helpers"
import type {
  BracketOptions,
  BracketParticipant,
  RoundRobinBody,
} from "./types"

export function generateRoundRobin(
  participants: BracketParticipant[],
  options: BracketOptions = {}
): RoundRobinBody {
  return {
    kind: "round_robin",
    rounds: buildRoundRobinRounds(participants, "rr", {
      doubleRound: options.doubleRound,
    }),
  }
}
