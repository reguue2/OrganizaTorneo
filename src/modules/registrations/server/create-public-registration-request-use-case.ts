import { createAdminClient } from "@/lib/supabase/admin"
import { normalizeSpanishPhone } from "@/modules/registrations/domain"
import { createApiErrorPayload } from "@/shared/api/errors"
import type { Json } from "@/types/database"

import { dispatchRegistrationVerificationEmail } from "./email"
import {
  createRegistrationErrorPayload,
  getRegistrationErrorCode,
} from "./errors"
import { isJsonObject } from "./request-utils"

export type CreatePublicRegistrationRequestInput = {
  tournamentId: string
  categoryId: string | null
  displayName: string
  contactPhone: string
  contactEmail: string
  paymentMethod: "cash" | "online"
}

type PublicRegistrationRequestRpcResult = {
  request_id: string
  verification_code: string
  expires_at: string
  amount: number
  payment_method: "cash" | "online"
}

type UseCaseResult =
  | { status: 200; body: Record<string, unknown> }
  | { status: 400 | 409 | 500; body: Record<string, unknown> }

type ConflictResult = { status: 409; body: Record<string, unknown> }

type SupabaseAdminClient = ReturnType<typeof createAdminClient>

type CapacityCheckResult =
  | { status: "available" }
  | { status: "category_full" }
  | { status: "tournament_full" }

function parseRpcResult(value: Json | null): PublicRegistrationRequestRpcResult | null {
  if (!isJsonObject(value)) return null

  const requestId = value.request_id
  const verificationCode = value.verification_code
  const expiresAt = value.expires_at
  const amount = value.amount
  const paymentMethod = value.payment_method

  if (
    typeof requestId !== "string" ||
    typeof verificationCode !== "string" ||
    typeof expiresAt !== "string" ||
    typeof amount !== "number" ||
    (paymentMethod !== "cash" && paymentMethod !== "online")
  ) {
    return null
  }

  return {
    request_id: requestId,
    verification_code: verificationCode,
    expires_at: expiresAt,
    amount,
    payment_method: paymentMethod,
  }
}

function isActiveRegistrationStatus(status: string | null) {
  return status !== "cancelled" && status !== "expired"
}

async function getCapacityCheckResult(
  supabase: SupabaseAdminClient,
  input: Pick<CreatePublicRegistrationRequestInput, "categoryId" | "tournamentId">
): Promise<CapacityCheckResult> {
  if (input.categoryId) {
    const { data: category } = await supabase
      .from("categories")
      .select("max_participants")
      .eq("id", input.categoryId)
      .eq("tournament_id", input.tournamentId)
      .maybeSingle<{ max_participants: number | null }>()

    if (!category || category.max_participants === null) {
      return { status: "available" }
    }

    const { data: registrations } = await supabase
      .from("registrations")
      .select("status")
      .eq("tournament_id", input.tournamentId)
      .eq("category_id", input.categoryId)
      .returns<Array<{ status: string | null }>>()

    const activeCount = (registrations ?? []).filter((registration) =>
      isActiveRegistrationStatus(registration.status)
    ).length

    return activeCount >= category.max_participants
      ? { status: "category_full" }
      : { status: "available" }
  }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("max_participants")
    .eq("id", input.tournamentId)
    .maybeSingle<{ max_participants: number | null }>()

  if (!tournament || tournament.max_participants === null) {
    return { status: "available" }
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select("status")
    .eq("tournament_id", input.tournamentId)
    .is("category_id", null)
    .returns<Array<{ status: string | null }>>()

  const activeCount = (registrations ?? []).filter((registration) =>
    isActiveRegistrationStatus(registration.status)
  ).length

  return activeCount >= tournament.max_participants
    ? { status: "tournament_full" }
    : { status: "available" }
}

function createCapacityErrorResult(
  capacity: CapacityCheckResult
): ConflictResult | null {
  if (capacity.status === "category_full") {
    return {
      status: 409,
      body: createRegistrationErrorPayload("Category is full"),
    }
  }

  if (capacity.status === "tournament_full") {
    return {
      status: 409,
      body: createRegistrationErrorPayload("Tournament is full"),
    }
  }

  return null
}

export async function createPublicRegistrationRequestUseCase(
  input: CreatePublicRegistrationRequestInput
): Promise<UseCaseResult> {
  const normalizedPhone = normalizeSpanishPhone(input.contactPhone)
  if (!normalizedPhone) {
    return {
      status: 400,
      body: createApiErrorPayload(
        "Introduce un teléfono español válido.",
        "VALIDATION_ERROR"
      ),
    }
  }

  try {
    const supabase = createAdminClient()
    const capacityError = createCapacityErrorResult(
      await getCapacityCheckResult(supabase, input)
    )

    if (capacityError) {
      return capacityError
    }

    const { data, error } = await supabase.rpc("create_public_registration_request", {
      p_tournament_id: input.tournamentId,
      p_category_id: input.categoryId ?? undefined,
      p_display_name: input.displayName,
      p_contact_phone: input.contactPhone,
      p_contact_email: input.contactEmail,
      p_payment_method: input.paymentMethod,
    })

    if (error) {
      const capacityError = createCapacityErrorResult(
        await getCapacityCheckResult(supabase, input)
      )

      if (capacityError) {
        return capacityError
      }

      if (getRegistrationErrorCode(error.message) === "REGISTRATION_REQUEST_PENDING") {
        let query = supabase
          .from("registration_requests")
          .select("id, expires_at")
          .eq("tournament_id", input.tournamentId)
          .is("consumed_at", null)
          .gt("expires_at", new Date().toISOString())
          .eq("contact_email_normalized", input.contactEmail.trim().toLowerCase())
          .limit(1)

        if (input.categoryId) {
          query = query.eq("category_id", input.categoryId)
        } else {
          query = query.is("category_id", null)
        }

        const { data: pendingByEmail } = await query.maybeSingle()

        let pendingRequest = pendingByEmail

        if (!pendingRequest) {
          let phoneQuery = supabase
            .from("registration_requests")
            .select("id, expires_at")
            .eq("tournament_id", input.tournamentId)
            .is("consumed_at", null)
            .gt("expires_at", new Date().toISOString())
            .eq("contact_phone_normalized", normalizedPhone)
            .limit(1)

          if (input.categoryId) {
            phoneQuery = phoneQuery.eq("category_id", input.categoryId)
          } else {
            phoneQuery = phoneQuery.is("category_id", null)
          }

          const { data: pendingByPhone } = await phoneQuery.maybeSingle()
          pendingRequest = pendingByPhone
        }

        return {
          status: 409,
          body: {
            ...createRegistrationErrorPayload(error.message),
            pending_request_id: pendingRequest?.id ?? null,
            expires_at: pendingRequest?.expires_at ?? null,
          },
        }
      }

      return {
        status: 400,
        body: createRegistrationErrorPayload(error.message),
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

    const delivery = await dispatchRegistrationVerificationEmail({
      recipientEmail: input.contactEmail,
      verificationCode: result.verification_code,
      expiresAt: result.expires_at,
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
    console.error("public registration request use case failed:", error)

    return {
      status: 500,
      body: createApiErrorPayload(
        "No se pudo crear la solicitud de inscripción.",
        "ACTION_NOT_ALLOWED"
      ),
    }
  }
}
