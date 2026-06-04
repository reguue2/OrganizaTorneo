import type { createClient } from "@/lib/supabase/server"
import { createManagementErrorPayload } from "@/modules/organizer/domain"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type ManagementUseCaseResult =
  | { status: 200; body: { ok: true } }
  | { status: 400; body: ReturnType<typeof createManagementErrorPayload> }

export async function updateManagedTournamentStatusUseCase({
  nextStatus,
  supabase,
  tournamentId,
}: {
  nextStatus: "draft" | "published" | "closed" | "finished" | "cancelled"
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
  date,
  description,
  isPublic,
  province,
  registrationDeadline,
  rules,
  supabase,
  title,
  tournamentId,
}: {
  address?: string
  date?: string
  description?: string
  isPublic: boolean
  province?: string
  registrationDeadline?: string
  rules?: string
  supabase: SupabaseServerClient
  title: string
  tournamentId: string
}): Promise<ManagementUseCaseResult> {
  const { error } = await supabase.rpc("update_tournament_management_config", {
    p_tournament_id: tournamentId,
    p_title: title,
    p_description: description,
    p_rules: rules,
    p_province: province,
    p_address: address,
    p_date: date,
    p_registration_deadline: registrationDeadline,
    p_is_public: isPublic,
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
