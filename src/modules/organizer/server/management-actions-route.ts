import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createManagementErrorPayload } from "@/modules/organizer/domain"
import {
  approveManagedCashRegistrationUseCase,
  cancelManagedRegistrationUseCase,
  confirmManagedOnlineRegistrationUseCase,
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
  "draft",
  "published",
  "closed",
  "finished",
  "cancelled",
])

const UpdateTournamentStatusSchema = z.object({
  nextStatus: TournamentStatusSchema,
})

const UpdateTournamentConfigSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  rules: z.string().trim().optional(),
  province: z.string().trim().optional(),
  address: z.string().trim().optional(),
  date: z.string().trim().optional(),
  registrationDeadline: z.string().trim().optional(),
  isPublic: z.boolean(),
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

  const rawBody = await readJson(request)
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

  const result = await updateManagedTournamentConfigUseCase({
    address: emptyToUndefined(body.data.address),
    date: emptyToUndefined(body.data.date),
    description: emptyToUndefined(body.data.description),
    isPublic: body.data.isPublic,
    province: emptyToUndefined(body.data.province),
    registrationDeadline: emptyToUndefined(body.data.registrationDeadline),
    rules: emptyToUndefined(body.data.rules),
    supabase: auth.supabase,
    title: body.data.title,
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
