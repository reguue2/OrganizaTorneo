import type { AppErrorCode } from "@/shared/api/errors"

export type SubmitMode = "token" | "code"
export type FlowStatus = "idle" | "submitting" | "success" | "error"
export type EmailDeliveryStatus =
  | "sent"
  | "provider_not_configured"
  | "provider_error"
  | null

export type VerificationResult = {
  already_verified: boolean
  public_reference: string | null
  registration_status: string | null
  payment_method: "cash" | "online" | null
  amount: number | null
  cancel_code: string | null
  cancel_token: string | null
  email_delivery_status: EmailDeliveryStatus
  email_delivery_message: string | null
}

export type ErrorPayload = {
  error?: string
  code?: AppErrorCode
}

export type VerifyFlowProps = {
  initialRequestId: string
  initialToken: string
  initialCode: string
}
