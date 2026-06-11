import type {
  CategoryRow,
  ParticipantRow,
  PaymentRow,
  RegistrationRow,
  TournamentRow,
} from "@/modules/organizer/domain"
import type {
  BracketFormat,
  BracketOptions,
  TournamentBracketRow,
} from "@/modules/tournaments/domain"

export type ManageDashboardProps = {
  tournament: TournamentRow
  categories: CategoryRow[]
  registrations: RegistrationRow[]
  participants: ParticipantRow[]
  payments: PaymentRow[]
  brackets: TournamentBracketRow[]
}

export type RegistrationView = {
  registration: RegistrationRow
  participant: ParticipantRow | null
  category: CategoryRow | null
  payment: PaymentRow | null
  amount: number
}

/** One bracket to (re)generate: a category, or the whole tournament (`null`). */
export type BracketConfig = {
  categoryId: string | null
  format: BracketFormat
  options: BracketOptions
}

export type ConfigForm = {
  title: string
  description: string
  rules: string
  province: string
  address: string
  date: string
  registration_deadline: string
  is_public: boolean
  show_organizer_contact: boolean
  payment_method: "cash" | "online" | "both"
  participant_type: "individual" | "team" | null
  entry_price: string
  max_participants: string
  no_max_participants: boolean
  prize_mode: "none" | "global" | "per_category"
  prizes: string
  categories: ConfigCategoryForm[]
}

export type ConfigCategoryForm = {
  key: string
  id: string | null
  name: string
  participant_type: "individual" | "team"
  price: string
  max_participants: string
  no_max_participants: boolean
  start_at: string
  address: string
  prizes: string
}

export type SaveNotice = {
  message: string
  variant: "destructive" | "success"
}
