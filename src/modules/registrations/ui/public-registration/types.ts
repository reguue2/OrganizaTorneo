import type { ParticipantType as TournamentParticipantType } from "@/modules/tournaments/domain"
import type { AppErrorCode } from "@/shared/api/errors"

export type ParticipantType = TournamentParticipantType
export type RegistrationPaymentMethod = "cash" | "online"
export type EmailDeliveryStatus = "sent" | "provider_not_configured" | "provider_error"

export type Category = {
  id: string
  name: string
  participant_type: ParticipantType
  price: number
  min_participants: number
  max_participants: number | null
  start_at: string | null
  address: string | null
}

export type RegisterFormProps = {
  tournamentId: string
  tournamentTitle: string
  hasCategories: boolean
  tournamentParticipantType: ParticipantType | null
  categories: Category[]
  entryPrice: number
  paymentMethod: "cash" | "online" | "both" | null
}

export type RegistrationRequestResult = {
  request_id: string
  expires_at: string
  amount: number
  payment_method: RegistrationPaymentMethod
  email_delivery_status: EmailDeliveryStatus
  email_delivery_message: string
}

export type ErrorPayload = {
  error?: string
  code?: AppErrorCode
  pending_request_id?: string | null
  expires_at?: string | null
  retry_after_seconds?: number | null
}
