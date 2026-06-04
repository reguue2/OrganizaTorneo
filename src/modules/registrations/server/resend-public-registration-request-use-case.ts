import { createAdminClient } from "@/lib/supabase/admin"
import { createApiErrorPayload } from "@/shared/api/errors"
import type { Json } from "@/types/database"

import { dispatchRegistrationVerificationEmail } from "./email"
import {
  createRegistrationErrorPayload,
  getRegistrationErrorCode,
} from "./errors"
import { isJsonObject, resolveRequestOrigin } from "./request-utils"

export type ResendPublicRegistrationRequestInput = {
  requestId: string
}

type ResendRequestRpcResult = {
  request_id: string
  verification_code: string
  verification_token: string
  expires_at: string
  amount: number
  payment_method: "cash" | "online"
  contact_email: string
}

type UseCaseResult =
  | { status: 200; body: Record<string, unknown> }
  | { status: 400 | 429 | 500; body: Record<string, unknown> }

function parseRpcResult(value: Json | null): ResendRequestRpcResult | null {
  if (!isJsonObject(value)) return null

  const requestId = value.request_id
  const verificationCode = value.verification_code
  const verificationToken = value.verification_token
  const expiresAt = value.expires_at
  const amount = value.amount
  const paymentMethod = value.payment_method
  const contactEmail = value.contact_email

  if (
    typeof requestId !== "string" ||
    typeof verificationCode !== "string" ||
    typeof verificationToken !== "string" ||
    typeof expiresAt !== "string" ||
    typeof amount !== "number" ||
    typeof contactEmail !== "string" ||
    (paymentMethod !== "cash" && paymentMethod !== "online")
  ) {
    return null
  }

  return {
    request_id: requestId,
    verification_code: verificationCode,
    verification_token: verificationToken,
    expires_at: expiresAt,
    amount,
    payment_method: paymentMethod,
    contact_email: contactEmail,
  }
}

function extractRetryAfterSeconds(message: string) {
  const match = message.match(/(\d+)\s*seconds? remaining/i)
  if (!match) return null

  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export async function resendPublicRegistrationRequestUseCase(
  input: ResendPublicRegistrationRequestInput,
  request: Request
): Promise<UseCaseResult> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("resend_public_registration_request", {
      p_request_id: input.requestId,
    })

    if (error) {
      const retryAfter = extractRetryAfterSeconds(error.message)
      const errorPayload = createRegistrationErrorPayload(error.message)
      const isRateLimited = getRegistrationErrorCode(error.message) === "RATE_LIMITED"

      if (retryAfter !== null) {
        return {
          status: 429,
          body: {
            ...errorPayload,
            retry_after_seconds: retryAfter,
          },
        }
      }

      return {
        status: isRateLimited ? 429 : 400,
        body: errorPayload,
      }
    }

    const result = parseRpcResult(data)

    if (!result) {
      return {
        status: 500,
        body: createApiErrorPayload(
          "La respuesta del servidor no tiene el formato esperado.",
          "VALIDATION_ERROR"
        ),
      }
    }

    const verifyUrl = `${resolveRequestOrigin(request)}/inscripcion/verificar?request=${encodeURIComponent(
      result.request_id
    )}&token=${encodeURIComponent(result.verification_token)}`

    const delivery = await dispatchRegistrationVerificationEmail({
      requestId: result.request_id,
      recipientEmail: result.contact_email,
      verificationCode: result.verification_code,
      verificationToken: result.verification_token,
      expiresAt: result.expires_at,
      verifyUrl,
    })

    return {
      status: 200,
      body: {
        request_id: result.request_id,
        expires_at: result.expires_at,
        amount: result.amount,
        payment_method: result.payment_method,
        email_delivery_status: delivery.status,
        email_delivery_message: delivery.message,
      },
    }
  } catch (error) {
    console.error("resend public registration request use case failed:", error)

    return {
      status: 500,
      body: createApiErrorPayload(
        "No se pudo reenviar la verificación.",
        "ACTION_NOT_ALLOWED"
      ),
    }
  }
}
