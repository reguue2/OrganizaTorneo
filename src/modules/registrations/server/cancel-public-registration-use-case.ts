import { createAdminClient } from "@/lib/supabase/admin"
import { createApiErrorPayload } from "@/shared/api/errors"
import type { Json } from "@/types/database"

import { createRegistrationErrorPayload } from "./errors"
import { isJsonObject } from "./request-utils"

export type CancelPublicRegistrationInput = {
  publicReference: string
  cancelToken?: string
  cancelCode?: string
}

type CancelPublicRegistrationResult = {
  already_cancelled: boolean
  public_reference: string | null
  status: string | null
}

type UseCaseResult =
  | { status: 200; body: CancelPublicRegistrationResult }
  | { status: 400 | 500; body: { error: string; code: string } }

function parseCancelPublicRegistrationResult(
  value: Json | null
): CancelPublicRegistrationResult | null {
  if (!isJsonObject(value)) return null

  const alreadyCancelled = value.already_cancelled
  const publicReference = value.public_reference
  const status = value.status

  if (typeof alreadyCancelled !== "boolean") return null
  if (publicReference !== null && typeof publicReference !== "string") return null
  if (status !== null && typeof status !== "string") return null

  return {
    already_cancelled: alreadyCancelled,
    public_reference: publicReference,
    status,
  }
}

export async function cancelPublicRegistrationUseCase(
  input: CancelPublicRegistrationInput
): Promise<UseCaseResult> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc("cancel_public_registration", {
      p_public_reference: input.publicReference,
      p_cancel_token: input.cancelToken || undefined,
      p_cancel_code: input.cancelCode || undefined,
    })

    if (error) {
      return {
        status: 400,
        body: createRegistrationErrorPayload(error.message),
      }
    }

    const result = parseCancelPublicRegistrationResult(data)

    if (!result) {
      return {
        status: 500,
        body: createApiErrorPayload(
          "La respuesta del servidor no tiene el formato esperado.",
          "VALIDATION_ERROR"
        ),
      }
    }

    return { status: 200, body: result }
  } catch (error) {
    console.error("cancel public registration use case failed:", error)

    return {
      status: 500,
      body: createApiErrorPayload(
        "No se pudo cancelar la inscripción.",
        "ACTION_NOT_ALLOWED"
      ),
    }
  }
}
