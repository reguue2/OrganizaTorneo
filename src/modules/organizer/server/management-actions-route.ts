import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createManagementErrorPayload } from "@/modules/organizer/domain"
import { normalizeSpanishPhone } from "@/shared/contact/phone"
import { isValidMoneyAmount, MAX_POSTGRES_INTEGER } from "@/shared/forms/numbers"
import {
  approveManagedCashRegistrationUseCase,
  cancelManagedRegistrationUseCase,
  confirmManagedOnlineRegistrationUseCase,
  createManualRegistrationUseCase,
  updateManagedTournamentConfigUseCase,
  updateManagedTournamentStatusUseCase,
} from "./management-actions-use-cases"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type AuthenticatedClientResult =
  | { response: NextResponse; supabase?: never }
  | { response?: never; supabase: SupabaseServerClient }

type RouteContext<TParams extends Record<string, string>> = {
  params: Promise<TParams>
}

const TournamentParamsSchema = z.object({
  tournamentId: z.string().uuid(),
})

const RegistrationParamsSchema = z.object({
  registrationId: z.string().uuid(),
})

const TournamentStatusSchema = z.enum([
  "published",
  "closed",
  "cancelled",
])

const UpdateTournamentStatusSchema = z.object({
  nextStatus: TournamentStatusSchema,
})

const CreateManualRegistrationSchema = z.object({
  displayName: z.string().trim().min(1),
  categoryId: z.string().uuid().optional(),
  contactPhone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || normalizeSpanishPhone(value) !== null, {
      message: "Invalid phone",
    }),
  contactEmail: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Invalid email",
    }),
  markAsPaid: z.boolean(),
})

const UpdateTournamentConfigSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  rules: z.string().trim().optional(),
  province: z.string().trim().min(1),
  address: z.string().trim().min(1),
  date: z.string().trim().min(1),
  registrationDeadline: z.string().trim().min(1),
  isPublic: z.boolean(),
  showOrganizerContact: z.boolean(),
  paymentMethod: z.enum(["cash", "online", "both"]),
  participantType: z.enum(["individual", "team"]).nullable(),
  entryPrice: z.number().nonnegative().refine(isValidMoneyAmount),
  maxParticipants: z.number().int().positive().max(MAX_POSTGRES_INTEGER).nullable(),
  prizeMode: z.enum(["none", "global", "per_category"]),
  prizes: z.string().trim().optional(),
  posterAction: z.enum(["keep", "remove", "replace"]),
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      isNew: z.boolean(),
      name: z.string().trim().min(1),
      participantType: z.enum(["individual", "team"]),
      price: z.number().nonnegative().refine(isValidMoneyAmount),
      maxParticipants: z.number().int().positive().max(MAX_POSTGRES_INTEGER).nullable(),
      startAt: z.string().trim().nullable(),
      address: z.string().trim().nullable(),
      prizes: z.string().trim().nullable(),
    })
  ),
})

async function requireAuthenticatedClient(): Promise<AuthenticatedClientResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      response: NextResponse.json(
        createManagementErrorPayload(
          "Debes iniciar sesión para gestionar este torneo.",
          "MANAGEMENT_AUTH_REQUIRED"
        ),
        { status: 401 }
      ),
    }
  }

  return { supabase }
}

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function emptyToUndefined(value: string | undefined) {
  return value && value.length > 0 ? value : undefined
}

export async function updateManagedTournamentStatus(
  request: Request,
  context: RouteContext<{ tournamentId: string }>
) {
  const params = TournamentParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "El torneo no es válido.",
        "MANAGEMENT_TOURNAMENT_INVALID"
      ),
      { status: 400 }
    )
  }

  const rawBody = await readJson(request)
  const body = UpdateTournamentStatusSchema.safeParse(rawBody)

  if (!body.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "El estado solicitado no es válido.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await updateManagedTournamentStatusUseCase({
    nextStatus: body.data.nextStatus,
    supabase: auth.supabase,
    tournamentId: params.data.tournamentId,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function updateManagedTournamentConfig(
  request: Request,
  context: RouteContext<{ tournamentId: string }>
) {
  const params = TournamentParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "El torneo no es válido.",
        "MANAGEMENT_TOURNAMENT_INVALID"
      ),
      { status: 400 }
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      createManagementErrorPayload(
        "Los datos de configuraciÃ³n no son vÃ¡lidos.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const configEntry = formData.get("config")
  let rawBody: unknown = null
  if (typeof configEntry === "string") {
    try {
      rawBody = JSON.parse(configEntry)
    } catch {
      rawBody = null
    }
  }
  const body = UpdateTournamentConfigSchema.safeParse(rawBody)

  if (!body.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "Los datos de configuración no son válidos.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const posterEntry = formData.get("poster")
  const poster =
    posterEntry instanceof File && posterEntry.size > 0 ? posterEntry : null

  if (body.data.posterAction === "replace" && !poster) {
    return NextResponse.json(
      createManagementErrorPayload(
        "El cartel debe ser una imagen vÃ¡lida.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const result = await updateManagedTournamentConfigUseCase({
    address: body.data.address,
    categories: body.data.categories,
    date: body.data.date,
    description: emptyToUndefined(body.data.description),
    entryPrice: body.data.entryPrice,
    isPublic: body.data.isPublic,
    showOrganizerContact: body.data.showOrganizerContact,
    maxParticipants: body.data.maxParticipants,
    participantType: body.data.participantType,
    paymentMethod: body.data.paymentMethod,
    poster,
    posterAction: body.data.posterAction,
    prizeMode: body.data.prizeMode,
    prizes: emptyToUndefined(body.data.prizes),
    province: body.data.province,
    registrationDeadline: body.data.registrationDeadline,
    rules: emptyToUndefined(body.data.rules),
    supabase: auth.supabase,
    title: body.data.title,
    tournamentId: params.data.tournamentId,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function createManualRegistration(
  request: Request,
  context: RouteContext<{ tournamentId: string }>
) {
  const params = TournamentParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "El torneo no es válido.",
        "MANAGEMENT_TOURNAMENT_INVALID"
      ),
      { status: 400 }
    )
  }

  const rawBody = await readJson(request)
  const body = CreateManualRegistrationSchema.safeParse(rawBody)

  if (!body.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "Los datos de la inscripción no son válidos.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await createManualRegistrationUseCase({
    categoryId: body.data.categoryId,
    contactEmail: emptyToUndefined(body.data.contactEmail),
    contactPhone: body.data.contactPhone
      ? (normalizeSpanishPhone(body.data.contactPhone) ?? undefined)
      : undefined,
    displayName: body.data.displayName,
    markAsPaid: body.data.markAsPaid,
    supabase: auth.supabase,
    tournamentId: params.data.tournamentId,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function approveManagedCashRegistration(
  _request: Request,
  context: RouteContext<{ registrationId: string }>
) {
  const params = RegistrationParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "La inscripción no es válida.",
        "MANAGEMENT_REGISTRATION_INVALID"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await approveManagedCashRegistrationUseCase({
    registrationId: params.data.registrationId,
    supabase: auth.supabase,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function confirmManagedOnlineRegistration(
  _request: Request,
  context: RouteContext<{ registrationId: string }>
) {
  const params = RegistrationParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "La inscripción no es válida.",
        "MANAGEMENT_REGISTRATION_INVALID"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await confirmManagedOnlineRegistrationUseCase({
    registrationId: params.data.registrationId,
    supabase: auth.supabase,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function cancelManagedRegistration(
  _request: Request,
  context: RouteContext<{ registrationId: string }>
) {
  const params = RegistrationParamsSchema.safeParse(await context.params)
  if (!params.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "La inscripción no es válida.",
        "MANAGEMENT_REGISTRATION_INVALID"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await cancelManagedRegistrationUseCase({
    registrationId: params.data.registrationId,
    supabase: auth.supabase,
  })

  return NextResponse.json(result.body, { status: result.status })
}
