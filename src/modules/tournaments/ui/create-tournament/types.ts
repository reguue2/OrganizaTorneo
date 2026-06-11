import type { LucideIcon } from "lucide-react"

export type CreateTournamentStepId =
  | "basics"
  | "structure"
  | "pricing"
  | "details"
  | "review"

export type PrizeMode = "none" | "global" | "per_category"
export type PaymentMethod = "cash" | "online" | "both"
export type ParticipantType = "individual" | "team"

export type CreateTournamentCategoryDraft = {
  id: string
  name: string
  participant_type: ParticipantType | null
  price: string
  max_participants: string
  noMax: boolean
  hasCustomDate: boolean
  hasCustomAddress: boolean
  start_at: string
  address: string
  prizes: string
}

export type CreateTournamentDraft = {
  title: string
  description: string
  province: string
  address: string
  date: string
  registration_deadline: string
  is_public: boolean
  has_categories: boolean
  participant_type: ParticipantType | null
  max_participants: string
  noMax: boolean
  entry_price: string
  payment_method: PaymentMethod
  prize_mode: PrizeMode
  prizes: string
  rules: string
  categories: CreateTournamentCategoryDraft[]
  show_contact: boolean
  contact_name: string
  contact_whatsapp: string
  contact_email: string
}

export type CreateTournamentErrors = Record<string, string>

export type UpdateCreateTournamentDraftValue = <
  Key extends keyof CreateTournamentDraft,
>(
  key: Key,
  value: CreateTournamentDraft[Key]
) => void

export type CreateTournamentPreviewItem = {
  label: string
  value: string
  icon: LucideIcon
}
