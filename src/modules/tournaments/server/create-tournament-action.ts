"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/types/database"
import { parseCreateTournamentFormData } from "@/modules/tournaments/schemas"

export type CreateTournamentActionState = {
  error: string | null
}

type CreateAndPublishTournamentRpcArgs =
  Database["public"]["Functions"]["create_and_publish_tournament"]["Args"]

export async function createTournament(
  _prevState: CreateTournamentActionState,
  formData: FormData
): Promise<CreateTournamentActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Debes iniciar sesión para crear un torneo." }
  }

  const posterEntry = formData.get("poster")
  const file =
    posterEntry instanceof File && posterEntry.size > 0 ? posterEntry : null

  if (file && !file.type.startsWith("image/")) {
    return { error: "El cartel debe ser una imagen válida." }
  }

  if (file && file.size > 5 * 1024 * 1024) {
    return { error: "El cartel no puede superar los 5MB." }
  }

  const parsed = parseCreateTournamentFormData(formData)
  if (!parsed.success) return { error: parsed.error }

  const tournament = parsed.data

  let fileName: string | null = null
  let posterUrl: string | null = null

  if (file) {
    const fileExt = file.name.split(".").pop() ?? "jpg"
    fileName = `${user.id}/${uuidv4()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("tournament-posters")
      .upload(fileName, file)

    if (uploadError) {
      return { error: "No se pudo subir el cartel del torneo." }
    }

    const { data: publicUrlData } = supabase.storage
      .from("tournament-posters")
      .getPublicUrl(fileName)

    posterUrl = publicUrlData.publicUrl
  }

  const rpcArgs: CreateAndPublishTournamentRpcArgs = {
    p_title: tournament.title,
    p_description: tournament.description || null,
    p_poster_url: posterUrl,
    p_province: tournament.province,
    p_address: tournament.address,
    p_date: tournament.date,
    p_registration_deadline: tournament.registration_deadline,
    p_is_public: tournament.is_public,
    p_has_categories: tournament.has_categories,
    p_participant_type: tournament.has_categories ? null : tournament.participant_type,
    p_min_participants: tournament.min_participants,
    p_max_participants: tournament.max_participants,
    p_payment_method: tournament.payment_method ?? undefined,
    p_prize_mode: tournament.prize_mode,
    p_prizes: tournament.prizes || null,
    p_rules: tournament.rules || null,
    p_entry_price: tournament.entry_price,
    p_categories: tournament.categories,
  }

  const { data, error: rpcError } = await supabase.rpc(
    "create_and_publish_tournament",
    rpcArgs
  )

  if (rpcError) {
    if (fileName) {
      await supabase.storage.from("tournament-posters").remove([fileName])
    }
    return { error: rpcError.message }
  }

  const tournamentId = typeof data === "string" ? data : null

  if (!tournamentId) {
    if (fileName) {
      await supabase.storage.from("tournament-posters").remove([fileName])
    }
    return { error: "No se pudo crear el torneo." }
  }

  redirect(`/torneos/${tournamentId}`)
}
