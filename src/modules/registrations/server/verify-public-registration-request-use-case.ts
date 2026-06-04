import { createAdminClient } from "@/lib/supabase/admin"
import { createApiErrorPayload } from "@/shared/api/errors"
import type { Json } from "@/types/database"

import { dispatchRegistrationConfirmationEmail } from "./email"
import { createRegistrationErrorPayload } from "./errors"
import { isJsonObject, resolveRequestOrigin } from "./request-utils"

export type VerifyPublicRegistrationRequestInput = {
  requestId: string
  verificationToken?: string
  verificationCode?: string
}

type VerificationResult = {
  already_verified: boolean
  public_reference: string | null
  registration_status: string | null
  payment_method: "cash" | "online" | null
  amount: number | null
  cancel_code: string | null
  cancel_token: string | null
}

type UseCaseResult =
  | { status: 200; body: Record<string, unknown> }
  | { status: 400 | 500; body: Record<string, unknown> }

function parseVerificationResult(value: Json | null): VerificationResult | null {
  if (!isJsonObject(value)) return null

  const alreadyVerified = value.already_verified
  const publicReference = value.public_reference
  const registrationStatus = value.registration_status
  const paymentMethod = value.payment_method
  const amount = value.amount
  const cancelCode = value.cancel_code
  const cancelToken = value.cancel_token

  if (typeof alreadyVerified !== "boolean") return null
  if (publicReference !== null && typeof publicReference !== "string") return null
  if (registrationStatus !== null && typeof registrationStatus !== "string") return null
  if (paymentMethod !== null && paymentMethod !== "cash" && paymentMethod !== "online") {
    return null
  }
  if (amount !== null && typeof amount !== "number") return null
  if (cancelCode !== null && typeof cancelCode !== "string") return null
  if (cancelToken !== null && typeof cancelToken !== "string") return null

  return {
    already_verified: alreadyVerified,
    public_reference: publicReference,
    registration_status: registrationStatus,
    payment_method: paymentMethod,
    amount,
    cancel_code: cancelCode,
    cancel_token: cancelToken,
  }
}

export async function verifyPublicRegistrationRequestUseCase(
  input: VerifyPublicRegistrationRequestInput,
  request: Request
): Promise<UseCaseResult> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("verify_public_registration_request", {
      p_request_id: input.requestId,
      p_verification_token: input.verificationToken || undefined,
      p_verification_code: input.verificationCode || undefined,
    })

    if (error) {
      return {
        status: 400,
        body: createRegistrationErrorPayload(error.message),
      }
    }

    const result = parseVerificationResult(data)

    if (!result) {
      return {
        status: 500,
        body: createApiErrorPayload(
          "La respuesta del servidor no tiene el formato esperado.",
          "VALIDATION_ERROR"
        ),
      }
    }

    let emailDeliveryStatus: "sent" | "provider_not_configured" | "provider_error" | null = null
    let emailDeliveryMessage: string | null = null

    if (!result.already_verified && result.public_reference) {
      const { data: requestRow } = await supabase
        .from("registration_requests")
        .select("contact_email, tournament_id, category_id")
        .eq("id", input.requestId)
        .maybeSingle()

      if (requestRow?.contact_email) {
        const { data: tournamentRow } = await supabase
          .from("tournaments")
          .select("title")
          .eq("id", requestRow.tournament_id)
          .maybeSingle()

        let categoryName: string | null = null

        if (requestRow.category_id) {
          const { data: categoryRow } = await supabase
            .from("categories")
            .select("name")
            .eq("id", requestRow.category_id)
            .maybeSingle()

          categoryName = categoryRow?.name ?? null
        }

        const cancelUrl = result.cancel_token
          ? `${resolveRequestOrigin(request)}/inscripcion/cancelar?reference=${encodeURIComponent(
              result.public_reference
            )}&token=${encodeURIComponent(result.cancel_token)}`
          : null

        const delivery = await dispatchRegistrationConfirmationEmail({
          recipientEmail: requestRow.contact_email,
          tournamentTitle: tournamentRow?.title ?? "Organiza Torneo",
          categoryName,
          publicReference: result.public_reference,
          registrationStatus: result.registration_status,
          paymentMethod: result.payment_method,
          amount: result.amount,
          cancelCode: result.cancel_code,
          cancelUrl,
        })

        emailDeliveryStatus = delivery.status
        emailDeliveryMessage = delivery.message
      }
    }

    return {
      status: 200,
      body: {
        ...result,
        email_delivery_status: emailDeliveryStatus,
        email_delivery_message: emailDeliveryMessage,
      },
    }
  } catch (error) {
    console.error("public registration verification use case failed:", error)

    return {
      status: 500,
      body: createApiErrorPayload(
        "No se pudo validar la inscripción.",
        "ACTION_NOT_ALLOWED"
      ),
    }
  }
}
