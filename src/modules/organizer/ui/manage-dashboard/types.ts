import type {
  CategoryRow,
  ParticipantRow,
  PaymentRow,
  RegistrationRow,
  TournamentRow,
} from "@/modules/organizer/domain"
import type { TournamentBracketRow } from "@/modules/tournaments/domain"

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

export type ConfigForm = {
  title: string
  description: string
  rules: string
  province: string
  address: string
  date: string
  registration_deadline: string
  is_public: boolean
}
