import type {
  PrizeMode,
  TournamentPaymentMethod,
  TournamentStatus,
} from "./rules"

export const VISIBLE_PUBLIC_TOURNAMENT_STATUSES = [
  "published",
  "closed",
  "finished",
  "cancelled",
] satisfies Exclude<TournamentStatus, "draft" | null>[]

export type ParticipantType = "individual" | "team"

export type ExploreCategory = {
  id: string
  name: string
  price: number
  min_participants: number
  max_participants: number | null
}

export type ExploreTournament = {
  id: string
  title: string
  poster_url: string | null
  province: string | null
  date: string | null
  registration_deadline: string | null
  status: TournamentStatus
  has_categories: boolean
  min_participants: number
  max_participants: number | null
  entry_price: number
  payment_method: TournamentPaymentMethod
  categories: ExploreCategory[] | null
}

export type PublicTournamentCategory = {
  id: string
  name: string
  price: number
  min_participants: number
  max_participants: number | null
  start_at: string | null
  address: string | null
  prizes: string | null
}

export type PublicTournamentDetail = {
  id: string
  title: string
  description: string | null
  poster_url: string | null
  prizes: string | null
  rules: string | null
  province: string | null
  address: string | null
  date: string | null
  max_participants: number | null
  min_participants: number
  registration_deadline: string | null
  payment_method: TournamentPaymentMethod
  is_public: boolean | null
  status: TournamentStatus
  has_categories: boolean
  prize_mode: PrizeMode
  entry_price: number
}

export type RegistrationCategory = {
  id: string
  name: string
  participant_type: ParticipantType
  price: number
  min_participants: number
  max_participants: number | null
  start_at: string | null
  address: string | null
}

export type RegistrationTournament = {
  id: string
  title: string
  province: string | null
  address: string | null
  date: string | null
  registration_deadline: string | null
  status: TournamentStatus
  has_categories: boolean
  participant_type: ParticipantType | null
  payment_method: TournamentPaymentMethod
  entry_price: number
  is_public: boolean | null
}
