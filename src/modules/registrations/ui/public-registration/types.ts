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
  onCategoryChange?: (categoryId: string) => void
}

export type RegistrationFormFieldErrors = Partial<{
  categoryId: string
  displayName: string
  contactPhone: string
  contactEmail: string
}>

export type RegistrationRequestResult = {
  request_id: string
  expires_at: string
  amount: number
  payment_method: RegistrationPaymentMethod
  email_delivery_status: EmailDeliveryStatus
  email_delivery_message: string
}

export type OnlineCheckoutResult = {
  checkout_url: string
}

export type RegistrationVerificationResult = {
  already_verified: boolean
  public_reference: string | null
  registration_status: string | null
  payment_method: RegistrationPaymentMethod | null
  amount: number | null
  cancel_code: string | null
  cancel_token: string | null
  email_delivery_status: EmailDeliveryStatus | null
  email_delivery_message: string | null
}

export type ErrorPayload = {
  error?: string
  code?: AppErrorCode
  pending_request_id?: string | null
  expires_at?: string | null
  retry_after_seconds?: number | null
}
