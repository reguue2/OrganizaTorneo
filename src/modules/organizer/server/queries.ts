import { createClient } from "@/lib/supabase/server"
import type {
  CategoryRow,
  OrganizerCategoryRow,
  OrganizerPaymentRow,
  OrganizerRegistrationRow,
  OrganizerTournamentRow,
  OrganizerTournamentsOverview,
  ParticipantRow,
  PaymentRow,
  RegistrationRow,
  TournamentRow,
} from "@/modules/organizer/domain"
import { buildOrganizerTournamentsOverview } from "@/modules/organizer/domain"

export type ManagedTournamentDashboard = {
  tournament: TournamentRow & { organizer_id: string }
  categories: CategoryRow[]
  registrations: RegistrationRow[]
  participants: ParticipantRow[]
  payments: PaymentRow[]
}

export async function getManagedTournamentDashboard(
  tournamentId: string,
  organizerId: string
): Promise<ManagedTournamentDashboard | null> {
  const supabase = await createClient()

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(`
      id,
      organizer_id,
      title,
      description,
      rules,
      province,
      address,
      date,
      registration_deadline,
      status,
      has_categories,
      payment_method,
      is_public,
      min_participants,
      max_participants,
      entry_price
    `)
    .eq("id", tournamentId)
    .single<TournamentRow & { organizer_id: string }>()

  if (tournamentError || !tournament || tournament.organizer_id !== organizerId) {
    return null
  }

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id,tournament_id,name,price,min_participants,max_participants")
    .eq("tournament_id", tournamentId)
    .order("name", { ascending: true })
    .returns<CategoryRow[]>()

  if (categoriesError) {
    throw new Error(categoriesError.message)
  }

  const { data: registrationsData, error: registrationsError } = await supabase
    .from("registrations")
    .select(`
      id,
      tournament_id,
      category_id,
      participant_id,
      status,
      payment_method,
      public_reference,
      created_at,
      cancelled_at
    `)
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: false })
    .returns<RegistrationRow[]>()

  if (registrationsError) {
    throw new Error(registrationsError.message)
  }

  const categories = categoriesData ?? []
  const registrations = registrationsData ?? []
  const participantIds = registrations.map((registration) => registration.participant_id)
  const registrationIds = registrations.map((registration) => registration.id)

  let participants: ParticipantRow[] = []
  let payments: PaymentRow[] = []

  if (participantIds.length > 0) {
    const { data: participantsData, error: participantsError } = await supabase
      .from("participants")
      .select("id,type,display_name,contact_phone,contact_email")
      .in("id", participantIds)
      .returns<ParticipantRow[]>()

    if (participantsError) {
      throw new Error(participantsError.message)
    }

    participants = participantsData ?? []
  }

  if (registrationIds.length > 0) {
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("id,registration_id,amount,payment_method,status,paid_at,created_at")
      .in("registration_id", registrationIds)
      .returns<PaymentRow[]>()

    if (paymentsError) {
      throw new Error(paymentsError.message)
    }

    payments = paymentsData ?? []
  }

  return {
    tournament,
    categories,
    registrations,
    participants,
    payments,
  }
}

export async function getOrganizerTournamentsOverview(
  organizerId: string
): Promise<OrganizerTournamentsOverview> {
  const supabase = await createClient()

  const { data: tournamentsData, error: tournamentsError } = await supabase
    .from("tournaments")
    .select(`
      id,
      title,
      date,
      registration_deadline,
      max_participants,
      min_participants,
      has_categories,
      entry_price,
      is_public,
      status,
      created_at,
      updated_at
    `)
    .eq("organizer_id", organizerId)
    .returns<OrganizerTournamentRow[]>()

  if (tournamentsError) {
    throw new Error(tournamentsError.message)
  }

  const tournaments = tournamentsData ?? []
  const tournamentIds = tournaments.map((tournament) => tournament.id)

  let categories: OrganizerCategoryRow[] = []
  let registrations: OrganizerRegistrationRow[] = []
  let payments: OrganizerPaymentRow[] = []

  if (tournamentIds.length > 0) {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("id,tournament_id,name,price,min_participants,max_participants")
      .in("tournament_id", tournamentIds)
      .returns<OrganizerCategoryRow[]>()

    if (categoriesError) {
      throw new Error(categoriesError.message)
    }

    categories = categoriesData ?? []

    const { data: registrationsData, error: registrationsError } = await supabase
      .from("registrations")
      .select("id,tournament_id,category_id,status,payment_method")
      .in("tournament_id", tournamentIds)
      .returns<OrganizerRegistrationRow[]>()

    if (registrationsError) {
      throw new Error(registrationsError.message)
    }

    registrations = registrationsData ?? []

    const registrationIds = registrations.map((registration) => registration.id)

    if (registrationIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("id,registration_id,amount,status")
        .in("registration_id", registrationIds)
        .returns<OrganizerPaymentRow[]>()

      if (paymentsError) {
        throw new Error(paymentsError.message)
      }

      payments = paymentsData ?? []
    }
  }

  return buildOrganizerTournamentsOverview({
    categories,
    payments,
    registrations,
    tournaments,
  })
}
