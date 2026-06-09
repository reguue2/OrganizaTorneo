import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createManagementErrorPayload } from "@/modules/organizer/domain"
import {
  deleteTournamentBracketsUseCase,
  generateTournamentBracketsUseCase,
} from "./bracket-actions-use-cases"

type RouteContext = {
  params: Promise<{ tournamentId: string }>
}

const TournamentParamsSchema = z.object({
  tournamentId: z.string().uuid(),
})

const BracketConfigSchema = z.object({
  categoryId: z.string().uuid().nullable(),
  format: z.enum(["single_elimination", "round_robin", "groups_knockout"]),
  options: z
    .object({
      thirdPlace: z.boolean().optional(),
      doubleRound: z.boolean().optional(),
      groupCount: z.number().int().positive().max(64).optional(),
      qualifiersPerGroup: z.number().int().positive().max(64).optional(),
    })
    .optional(),
})

const GenerateBracketSchema = z.object({
  brackets: z.array(BracketConfigSchema).min(1).max(64),
})

async function readJson(request: Request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

async function requireAuthenticatedClient() {
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
      supabase: null,
    }
  }

  return { response: null, supabase }
}

export async function generateTournamentBracket(
  request: Request,
  context: RouteContext
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

  const body = GenerateBracketSchema.safeParse(await readJson(request))
  if (!body.success) {
    return NextResponse.json(
      createManagementErrorPayload(
        "La configuración del cuadro no es válida.",
        "MANAGEMENT_VALIDATION_ERROR"
      ),
      { status: 400 }
    )
  }

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await generateTournamentBracketsUseCase({
    configs: body.data.brackets.map((bracket) => ({
      categoryId: bracket.categoryId,
      format: bracket.format,
      options: bracket.options ?? {},
    })),
    supabase: auth.supabase,
    tournamentId: params.data.tournamentId,
  })

  return NextResponse.json(result.body, { status: result.status })
}

export async function deleteTournamentBracket(
  _request: Request,
  context: RouteContext
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

  const auth = await requireAuthenticatedClient()
  if (auth.response) return auth.response

  const result = await deleteTournamentBracketsUseCase({
    supabase: auth.supabase,
    tournamentId: params.data.tournamentId,
  })

  return NextResponse.json(result.body, { status: result.status })
}
