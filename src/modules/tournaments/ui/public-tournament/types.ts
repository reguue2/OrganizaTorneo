import type {
  PublicTournamentCategory,
  PublicTournamentDetail,
} from "@/modules/tournaments/domain"

export type PublicTournamentViewData = {
  tournament: PublicTournamentDetail
  categories: PublicTournamentCategory[]
}
