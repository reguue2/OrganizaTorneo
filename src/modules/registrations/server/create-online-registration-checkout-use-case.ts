import { createAdminClient } from "@/lib/supabase/admin"
import { getStripeClient } from "@/lib/stripe"
import { normalizeSpanishPhone } from "@/modules/registrations/domain"
import { createApiErrorPayload } from "@/shared/api/errors"

import type { CreatePublicRegistrationRequestInput } from "./create-public-registration-request-use-case"
import { createRegistrationErrorPayload } from "./errors"
import { resolveRequestOrigin } from "./request-utils"

type UseCaseResult =
  | { status: 200; body: Record<string, unknown> }
  | { status: 400 | 409 | 500; body: Record<string, unknown> }

type CheckoutConfig = {
  amount: number
  itemName: string
}

function isActiveRegistrationStatus(status: string | null) {
  return status !== "cancelled" && status !== "expired"
}

async function getCheckoutConfig(
  input: CreatePublicRegistrationRequestInput,
  normalizedPhone: string
): Promise<
  | { config: CheckoutConfig; error: null }
  | { config: null; error: UseCaseResult }
> {
  const supabase = createAdminClient()
  const { data: tournament } = await supabase
    .from("tournaments")
    .select(
      "title,status,registration_deadline,has_categories,payment_method,entry_price,max_participants"
    )
    .eq("id", input.tournamentId)
    .maybeSingle()

  if (!tournament) {
    return {
      config: null,
      error: {
        status: 400,
        body: createRegistrationErrorPayload("Tournament not found"),
      },
    }
  }

  if (
    tournament.status !== "published" ||
    (tournament.registration_deadline &&
      new Date(tournament.registration_deadline).getTime() < Date.now())
  ) {
    return {
      config: null,
      error: {
        status: 400,
        body: createRegistrationErrorPayload("Tournament is not open for registration"),
      },
    }
  }

  if (tournament.payment_method !== "online" && tournament.payment_method !== "both") {
    return {
      config: null,
      error: {
        status: 400,
        body: createRegistrationErrorPayload(
          "Only cash registrations are available right now"
        ),
      },
    }
  }

  let amount = Number(tournament.entry_price)
  let itemName = tournament.title
  let maxParticipants = tournament.max_participants

  if (tournament.has_categories) {
    if (!input.categoryId) {
      return {
        config: null,
        error: {
          status: 400,
          body: createRegistrationErrorPayload("Category is required"),
        },
      }
    }

    const { data: category } = await supabase
      .from("categories")
      .select("name,price,max_participants")
      .eq("id", input.categoryId)
      .eq("tournament_id", input.tournamentId)
      .maybeSingle()

    if (!category) {
      return {
        config: null,
        error: {
          status: 400,
          body: createRegistrationErrorPayload("Category not linked to tournament"),
        },
      }
    }

    amount = Number(category.price)
    itemName = `${tournament.title} - ${category.name}`
    maxParticipants = category.max_participants
  } else if (input.categoryId) {
    return {
      config: null,
      error: {
        status: 400,
        body: createRegistrationErrorPayload("Category not linked to tournament"),
      },
    }
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      config: null,
      error: {
        status: 400,
        body: createApiErrorPayload(
          "El pago online solo está disponible para inscripciones con un importe superior a cero.",
          "PAYMENT_REQUIRED"
        ),
      },
    }
  }

  let registrationsQuery = supabase
    .from("registrations")
    .select("status,contact_email_normalized,contact_phone_normalized")
    .eq("tournament_id", input.tournamentId)

  registrationsQuery = input.categoryId
    ? registrationsQuery.eq("category_id", input.categoryId)
    : registrationsQuery.is("category_id", null)

  const { data: registrations } = await registrationsQuery.returns<
    Array<{
      status: string | null
      contact_email_normalized: string | null
      contact_phone_normalized: string | null
    }>
  >()
  const activeRegistrations = (registrations ?? []).filter((registration) =>
    isActiveRegistrationStatus(registration.status)
  )
  const normalizedEmail = input.contactEmail.trim().toLowerCase()

  if (
    activeRegistrations.some(
      (registration) =>
        registration.contact_email_normalized === normalizedEmail ||
        registration.contact_phone_normalized === normalizedPhone
    )
  ) {
    return {
      config: null,
      error: {
        status: 409,
        body: createRegistrationErrorPayload(
          "A registration already exists with this email or phone"
        ),
      },
    }
  }

  if (maxParticipants !== null) {
    const activeCount = activeRegistrations.length
    if (activeCount >= maxParticipants) {
      return {
        config: null,
        error: {
          status: 409,
          body: createRegistrationErrorPayload(
            input.categoryId ? "Category is full" : "Tournament is full"
          ),
        },
      }
    }
  }

  return {
    config: { amount, itemName },
    error: null,
  }
}

export async function createOnlineRegistrationCheckoutUseCase(
  input: CreatePublicRegistrationRequestInput,
  request: Request
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
    const checkoutConfig = await getCheckoutConfig(input, normalizedPhone)
    if (checkoutConfig.error) return checkoutConfig.error

    const origin = resolveRequestOrigin(request)
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.contactEmail,
      success_url: `${origin}/torneos/${encodeURIComponent(
        input.tournamentId
      )}?pago=correcto&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/torneo/${encodeURIComponent(
        input.tournamentId
      )}/inscribirse?pago=cancelado`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(checkoutConfig.config.amount * 100),
            product_data: {
              name: checkoutConfig.config.itemName,
            },
          },
        },
      ],
      metadata: {
        tournament_id: input.tournamentId,
        category_id: input.categoryId ?? "",
        display_name: input.displayName,
        contact_phone: input.contactPhone,
        contact_phone_normalized: normalizedPhone,
        contact_email: input.contactEmail,
        payment_method: "online",
      },
    })

    if (!session.url) {
      return {
        status: 500,
        body: createApiErrorPayload(
          "Stripe no devolvió una URL para completar el pago.",
          "PAYMENT_FAILED"
        ),
      }
    }

    return {
      status: 200,
      body: {
        checkout_url: session.url,
      },
    }
  } catch (error) {
    console.error("online registration checkout use case failed:", error)

    return {
      status: 500,
      body: createApiErrorPayload(
        "No se pudo iniciar el pago online.",
        "PAYMENT_FAILED"
      ),
    }
  }
}
