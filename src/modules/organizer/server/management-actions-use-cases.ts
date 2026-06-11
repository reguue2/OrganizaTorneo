import type { createClient } from "@/lib/supabase/server"
import { createManagementErrorPayload } from "@/modules/organizer/domain"
import type { Database, Json } from "@/types/database"
import { v4 as uuidv4 } from "uuid"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type ManagementUseCaseResult =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: ReturnType<typeof createManagementErrorPayload> }

type ManagedTournamentStatus = "published" | "closed" | "cancelled"

export async function updateManagedTournamentStatusUseCase({
  nextStatus,
  supabase,
  tournamentId,
}: {
  nextStatus: ManagedTournamentStatus
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("set_tournament_management_status", {
    p_tournament_id: tournamentId,
    p_next_status: nextStatus,
  })

  if (error) {
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  return { status: 200, body: { ok: true } }
}

export async function updateManagedTournamentConfigUseCase({
  address,
  categories,
  date,
  description,
  entryPrice,
  isPublic,
  maxParticipants,
  participantType,
  paymentMethod,
  poster,
  posterAction,
  prizeMode,
  prizes,
  province,
  registrationDeadline,
  rules,
  showOrganizerContact,
  supabase,
  title,
  tournamentId,
}: {
  address: string
  categories: Array<{
    id: string
    isNew: boolean
    name: string
    participantType: "individual" | "team"
    price: number
    maxParticipants: number | null
    startAt: string | null
    address: string | null
    prizes: string | null
  }>
  date: string
  description?: string
  entryPrice: number
  isPublic: boolean
  showOrganizerContact: boolean
  maxParticipants: number | null
  participantType: "individual" | "team" | null
  paymentMethod: "cash" | "online" | "both"
  poster: File | null
  posterAction: "keep" | "remove" | "replace"
  prizeMode: "none" | "global" | "per_category"
  prizes?: string
  province: string
  registrationDeadline: string
  rules?: string
  supabase: SupabaseServerClient
  title: string
  tournamentId: string
}): Promise<ManagementUseCaseResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 400,
      body: createManagementErrorPayload(
        "Debes iniciar sesiÃ³n para gestionar este torneo.",
        "MANAGEMENT_AUTH_REQUIRED"
      ),
    }
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("organizer_id,poster_url,status")
    .eq("id", tournamentId)
    .single<{
      organizer_id: string
      poster_url: string | null
      status: string | null
    }>()

  if (tournamentError || !tournament) {
    return {
      status: 400,
      body: createManagementErrorPayload(tournamentError?.message ?? "Tournament not found"),
    }
  }

  if (tournament.organizer_id !== user.id) {
    return {
      status: 400,
      body: createManagementErrorPayload("You cannot manage this tournament"),
    }
  }

  if (tournament.status !== "published" && tournament.status !== "closed") {
    return {
      status: 400,
      body: createManagementErrorPayload(
        "Only published or closed tournaments can be edited from this panel"
      ),
    }
  }

  let uploadedPosterPath: string | null = null
  let posterUrl = posterAction === "remove" ? null : tournament.poster_url

  if (posterAction === "replace" && poster) {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(poster.type)) {
      return {
        status: 400,
        body: createManagementErrorPayload(
          "El cartel debe ser una imagen vÃ¡lida.",
          "MANAGEMENT_VALIDATION_ERROR"
        ),
      }
    }

    if (poster.size > 5 * 1024 * 1024) {
      return {
        status: 400,
        body: createManagementErrorPayload(
          "El cartel no puede superar los 5MB.",
          "MANAGEMENT_VALIDATION_ERROR"
        ),
      }
    }

    const extensionByType: Record<string, string> = {
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }
    uploadedPosterPath = `${user.id}/${uuidv4()}.${extensionByType[poster.type]}`
    const { error: uploadError } = await supabase.storage
      .from("tournament-posters")
      .upload(uploadedPosterPath, poster)

    if (uploadError) {
      return {
        status: 400,
        body: createManagementErrorPayload("No se pudo subir el cartel del torneo."),
      }
    }

    const { data } = supabase.storage
      .from("tournament-posters")
      .getPublicUrl(uploadedPosterPath)
    posterUrl = data.publicUrl
  }

  const rpcArgs: Database["public"]["Functions"]["update_tournament_management_settings"]["Args"] = {
    p_tournament_id: tournamentId,
    p_title: title,
    p_description: description ?? null,
    p_rules: rules ?? null,
    p_province: province,
    p_address: address,
    p_date: date,
    p_registration_deadline: registrationDeadline,
    p_is_public: isPublic,
    p_poster_url: posterUrl,
    p_payment_method: paymentMethod,
    p_participant_type: participantType,
    p_entry_price: entryPrice,
    p_max_participants: maxParticipants,
    p_prize_mode: prizeMode,
    p_prizes: prizes ?? null,
    p_categories: categories.map((category) => ({
      id: category.id,
      is_new: category.isNew,
      name: category.name,
      participant_type: category.participantType,
      price: category.price,
      max_participants: category.maxParticipants,
      start_at: category.startAt,
      address: category.address,
      prizes: category.prizes,
    })) satisfies Json,
  }

  const { error } = await supabase.rpc("update_tournament_management_settings", rpcArgs)

  if (error) {
    if (uploadedPosterPath) {
      await supabase.storage.from("tournament-posters").remove([uploadedPosterPath])
    }
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  const { error: contactVisibilityError } = await supabase
    .from("tournaments")
    .update({ show_organizer_contact: showOrganizerContact })
    .eq("id", tournamentId)

  if (contactVisibilityError) {
    return {
      status: 400,
      body: createManagementErrorPayload(contactVisibilityError.message),
    }
  }

  const previousPosterPath = getTournamentPosterPath(tournament.poster_url)
  if (previousPosterPath && tournament.poster_url !== posterUrl) {
    await supabase.storage.from("tournament-posters").remove([previousPosterPath])
  }

  return { status: 200, body: { ok: true } }
}

function getTournamentPosterPath(url: string | null) {
  if (!url) return null

  const marker = "/storage/v1/object/public/tournament-posters/"
  const markerIndex = url.indexOf(marker)
  if (markerIndex < 0) return null

  return decodeURIComponent(url.slice(markerIndex + marker.length))
}

export async function createManualRegistrationUseCase({
  categoryId,
  contactEmail,
  contactPhone,
  displayName,
  markAsPaid,
  supabase,
  tournamentId,
}: {
  categoryId?: string
  contactEmail?: string
  contactPhone?: string
  displayName: string
  markAsPaid: boolean
  supabase: SupabaseServerClient
  tournamentId: string
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("create_manual_registration", {
    p_tournament_id: tournamentId,
    p_display_name: displayName,
    p_category_id: categoryId,
    p_contact_phone: contactPhone,
    p_contact_email: contactEmail,
    p_mark_as_paid: markAsPaid,
  })

  if (error) {
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  return { status: 200, body: { ok: true } }
}

export async function approveManagedCashRegistrationUseCase({
  registrationId,
  supabase,
}: {
  registrationId: string
  supabase: SupabaseServerClient
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("approve_cash_registration", {
    p_registration_id: registrationId,
  })

  if (error) {
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  return { status: 200, body: { ok: true } }
}

export async function confirmManagedOnlineRegistrationUseCase({
  registrationId,
  supabase,
}: {
  registrationId: string
  supabase: SupabaseServerClient
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("mark_online_registration_paid", {
    p_registration_id: registrationId,
  })

  if (error) {
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  return { status: 200, body: { ok: true } }
}

export async function cancelManagedRegistrationUseCase({
  registrationId,
  supabase,
}: {
  registrationId: string
  supabase: SupabaseServerClient
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("cancel_registration_by_organizer", {
    p_registration_id: registrationId,
  })

  if (error) {
    return {
      status: 400,
      body: createManagementErrorPayload(error.message),
    }
  }

  return { status: 200, body: { ok: true } }
}
