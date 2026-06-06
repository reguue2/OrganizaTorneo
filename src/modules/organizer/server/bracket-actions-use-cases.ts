import type { createClient } from "@/lib/supabase/server"
import {
  createManagementErrorPayload,
  type ManagementErrorCode,
} from "@/modules/organizer/domain"
import {
  buildBracketStructure,
  type BracketFormat,
  type BracketOptions,
  type BracketParticipant,
} from "@/modules/tournaments/domain"
import type { Json } from "@/types/database"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type BracketUseCaseResult =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: ReturnType<typeof createManagementErrorPayload> }

function fail(message: string, code?: ManagementErrorCode): BracketUseCaseResult {
  return { status: 400, body: createManagementErrorPayload(message, code) }
}

type GroupedConfirmed = {
  categoryId: string | null
  participants: BracketParticipant[]
}

function groupConfirmedParticipants({
  hasCategories,
  participantsById,
  registrations,
}: {
  hasCategories: boolean
  participantsById: Map<string, string>
  registrations: { participant_id: string; category_id: string | null }[]
}): GroupedConfirmed[] {
  const byCategory = new Map<string | null, BracketParticipant[]>()

  for (const registration of registrations) {
    const name = participantsById.get(registration.participant_id)
    if (!name) continue

    const key = hasCategories ? registration.category_id : null
    const current = byCategory.get(key) ?? []
    current.push({ id: registration.participant_id, name })
    byCategory.set(key, current)
  }

  return [...byCategory.entries()].map(([categoryId, participants]) => ({
    categoryId,
    participants,
  }))
}

export async function generateTournamentBracketsUseCase({
  format,
  options,
  supabase,
  tournamentId,
}: {
  format: BracketFormat
  options: BracketOptions
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<BracketUseCaseResult> {
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,organizer_id,status,has_categories")
    .eq("id", tournamentId)
    .single()

  if (tournamentError || !tournament) {
    return fail("No se encontró el torneo.", "MANAGEMENT_TOURNAMENT_INVALID")
  }

  if (tournament.status !== "closed" && tournament.status !== "finished") {
    return fail(
      "Cierra las inscripciones antes de generar el cuadro del torneo."
    )
  }

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

  if (participantIds.length < 2) {
    return fail("No hay suficientes participantes confirmados para generar el cuadro.")
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id,display_name")
    .in("id", participantIds)

  if (participantsError) {
    return fail(participantsError.message)
  }

  const participantsById = new Map(
    (participants ?? []).map((participant) => [participant.id, participant.display_name])
  )

  const groups = groupConfirmedParticipants({
    hasCategories: tournament.has_categories,
    participantsById,
    registrations: confirmed,
  }).filter((group) => group.participants.length >= 2)

  if (groups.length === 0) {
    return fail(
      "Cada bloque necesita al menos 2 participantes confirmados para generar el cuadro."
    )
  }

  const rows = groups.map((group) => {
    const structure = buildBracketStructure({
      format,
      options,
      participants: group.participants,
    })

    return {
      tournament_id: tournamentId,
      category_id: group.categoryId,
      format,
      participant_count: group.participants.length,
      structure: structure as unknown as Json,
    }
  })

  const { error: deleteError } = await supabase
    .from("tournament_brackets")
    .delete()
    .eq("tournament_id", tournamentId)

  if (deleteError) {
    return fail(deleteError.message)
  }

  const { error: insertError } = await supabase
    .from("tournament_brackets")
    .insert(rows)

  if (insertError) {
    return fail(insertError.message)
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
