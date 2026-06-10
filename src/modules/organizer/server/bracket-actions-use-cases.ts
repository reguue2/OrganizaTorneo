import type { createClient } from "@/lib/supabase/server"
import {
  createManagementErrorPayload,
  type ManagementErrorCode,
} from "@/modules/organizer/domain"
import {
  buildBracketStructure,
  findMatchById,
  resolveBracket,
  setMatchResult,
  type BracketFormat,
  type BracketOptions,
  type BracketParticipant,
  type BracketStructure,
  type MatchResult,
} from "@/modules/tournaments/domain"
import type { Json } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type BracketUseCaseResult =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: ReturnType<typeof createManagementErrorPayload> }

function fail(message: string, code?: ManagementErrorCode): BracketUseCaseResult {
  return { status: 400, body: createManagementErrorPayload(message, code) }
}

/** One bracket to (re)generate: a category, or the whole tournament (`null`). */
export type BracketGenerationConfig = {
  categoryId: string | null
  format: BracketFormat
  options: BracketOptions
}

type BracketInsertRow = {
  tournament_id: string
  category_id: string | null
  format: BracketFormat
  participant_count: number
  structure: Json
}

export async function generateTournamentBracketsUseCase({
  configs,
  supabase,
  tournamentId,
}: {
  configs: BracketGenerationConfig[]
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<BracketUseCaseResult> {
  if (configs.length === 0) {
    return fail("Selecciona al menos una categoría para generar el cuadro.")
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,status,has_categories")
    .eq("id", tournamentId)
    .single()

  if (tournamentError || !tournament) {
    return fail("No se encontró el torneo.", "MANAGEMENT_TOURNAMENT_INVALID")
  }

  if (tournament.status !== "closed" && tournament.status !== "finished") {
    return fail("Cierra las inscripciones antes de generar el cuadro del torneo.")
  }

  // Validate that the requested configs match the tournament structure.
  const categoryNames = new Map<string, string>()

  if (tournament.has_categories) {
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id,name")
      .eq("tournament_id", tournamentId)

    if (categoriesError) {
      return fail(categoriesError.message)
    }

    for (const category of categories ?? []) {
      categoryNames.set(category.id, category.name)
    }

    for (const config of configs) {
      if (!config.categoryId || !categoryNames.has(config.categoryId)) {
        return fail(
          "Una de las categorías seleccionadas no es válida.",
          "MANAGEMENT_VALIDATION_ERROR"
        )
      }
    }
  } else if (configs.length !== 1 || configs[0].categoryId !== null) {
    return fail("La configuración del cuadro no es válida.", "MANAGEMENT_VALIDATION_ERROR")
  }

  // Last config wins if a category is listed twice.
  const byCategory = new Map<string | null, BracketGenerationConfig>()
  for (const config of configs) {
    byCategory.set(config.categoryId, config)
  }
  const selected = [...byCategory.values()]

  const { data: registrations, error: registrationsError } = await supabase
    .from("registrations")
    .select("participant_id,category_id")
    .eq("tournament_id", tournamentId)
    .eq("status", "confirmed")

  if (registrationsError) {
    return fail(registrationsError.message)
  }

  const confirmed = registrations ?? []
  const participantIds = [...new Set(confirmed.map((row) => row.participant_id))]

  if (participantIds.length === 0) {
    return fail("No hay participantes confirmados para generar el cuadro.")
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id,display_name")
    .in("id", participantIds)

  if (participantsError) {
    return fail(participantsError.message)
  }

  const nameById = new Map(
    (participants ?? []).map((participant) => [participant.id, participant.display_name])
  )

  const participantsForCategory = (categoryId: string | null): BracketParticipant[] => {
    const seen = new Set<string>()
    const result: BracketParticipant[] = []
    for (const registration of confirmed) {
      if (tournament.has_categories && registration.category_id !== categoryId) continue
      if (seen.has(registration.participant_id)) continue
      const name = nameById.get(registration.participant_id)
      if (!name) continue
      seen.add(registration.participant_id)
      result.push({ id: registration.participant_id, name })
    }
    return result
  }

  const rows: BracketInsertRow[] = []
  for (const config of selected) {
    const groupParticipants = participantsForCategory(config.categoryId)

    if (groupParticipants.length < 2) {
      const label = config.categoryId
        ? categoryNames.get(config.categoryId) ?? "La categoría"
        : "El torneo"
      return fail(
        `«${label}» necesita al menos 2 participantes confirmados para generar el cuadro.`
      )
    }

    const structure = buildBracketStructure({
      format: config.format,
      options: config.options,
      participants: groupParticipants,
    })

    rows.push({
      tournament_id: tournamentId,
      category_id: config.categoryId,
      format: config.format,
      participant_count: groupParticipants.length,
      structure: structure as unknown as Json,
    })
  }

  // Delete only the brackets we are regenerating so other categories survive.
  const categoryIdsToReplace = selected
    .map((config) => config.categoryId)
    .filter((id): id is string => id !== null)
  const replacesGeneral = selected.some((config) => config.categoryId === null)

  if (categoryIdsToReplace.length > 0) {
    const { error } = await supabase
      .from("tournament_brackets")
      .delete()
      .eq("tournament_id", tournamentId)
      .in("category_id", categoryIdsToReplace)

    if (error) {
      return fail(error.message)
    }
  }

  if (replacesGeneral) {
    const { error } = await supabase
      .from("tournament_brackets")
      .delete()
      .eq("tournament_id", tournamentId)
      .is("category_id", null)

    if (error) {
      return fail(error.message)
    }
  }

  const { error: insertError } = await supabase.from("tournament_brackets").insert(rows)

  if (insertError) {
    return fail(insertError.message)
  }

  return { status: 200, body: { ok: true } }
}

export async function setBracketMatchResultUseCase({
  bracketId,
  matchId,
  result,
  supabase,
  tournamentId,
}: {
  bracketId: string
  matchId: string
  result: MatchResult | null
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<BracketUseCaseResult> {
  const { data: bracket, error } = await supabase
    .from("tournament_brackets")
    .select("id,structure")
    .eq("id", bracketId)
    .eq("tournament_id", tournamentId)
    .single()

  if (error || !bracket) {
    return fail("No se encontró el cuadro.", "MANAGEMENT_TOURNAMENT_INVALID")
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("status")
    .eq("id", tournamentId)
    .single()

  if (tournamentError || !tournament) {
    return fail("No se encontró el torneo.", "MANAGEMENT_TOURNAMENT_INVALID")
  }

  if (tournament.status !== "closed" && tournament.status !== "finished") {
    return fail("Cierra las inscripciones antes de registrar resultados.")
  }

  const structure = bracket.structure as unknown as BracketStructure

  if (!findMatchById(structure.body, matchId)) {
    return fail("El partido no existe en el cuadro.", "MANAGEMENT_VALIDATION_ERROR")
  }

  // Can only record a result once both contenders are known.
  if (result !== null) {
    const resolvedMatch = findMatchById(resolveBracket(structure).body, matchId)
    if (
      !resolvedMatch ||
      resolvedMatch.slotA.kind !== "participant" ||
      resolvedMatch.slotB.kind !== "participant"
    ) {
      return fail("Este partido aún no tiene definidos sus dos participantes.")
    }
  }

  let nextStructure: BracketStructure
  try {
    nextStructure = setMatchResult(structure, matchId, result)
  } catch (cause) {
    console.error("[bracket:setResult] failed to apply result", { matchId, cause })
    return fail("No se pudo registrar el resultado.", "MANAGEMENT_VALIDATION_ERROR")
  }

  const { data: updated, error: updateError } = await supabase
    .from("tournament_brackets")
    .update({ structure: nextStructure as unknown as Json })
    .eq("id", bracketId)
    .select("id")

  if (updateError) {
    console.error("[bracket:setResult] failed to persist structure", {
      bracketId,
      message: updateError.message,
    })
    return fail(updateError.message)
  }

  if (!updated || updated.length === 0) {
    console.error("[bracket:setResult] update affected no rows", { bracketId })
    return fail("No se pudo guardar el resultado. Vuelve a intentarlo.")
  }

  return { status: 200, body: { ok: true } }
}

export async function deleteTournamentBracketsUseCase({
  supabase,
  tournamentId,
}: {
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<BracketUseCaseResult> {
  const { error } = await supabase
    .from("tournament_brackets")
    .delete()
    .eq("tournament_id", tournamentId)

  if (error) {
    return fail(error.message)
  }

  return { status: 200, body: { ok: true } }
}
