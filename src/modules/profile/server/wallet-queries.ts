import { createClient } from "@/lib/supabase/server"
import {
  buildOrganizerWallet,
  type OrganizerWallet,
  type WalletParticipantInput,
  type WalletPaymentInput,
  type WalletRegistrationInput,
  type WalletTournamentInput,
} from "@/modules/profile/domain"

const EMPTY_WALLET: OrganizerWallet = {
  availableOnline: 0,
  collectedCash: 0,
  pendingOnline: 0,
  totalCollected: 0,
  currency: "EUR",
  movements: [],
  byTournament: [],
}

export async function getOrganizerWallet(
  organizerId: string
): Promise<OrganizerWallet> {
  const supabase = await createClient()

  const { data: tournamentsData, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id,title")
    .eq("organizer_id", organizerId)
    .returns<WalletTournamentInput[]>()

  if (tournamentsError) {
    throw new Error(tournamentsError.message)
  }

  const tournaments = tournamentsData ?? []
  const tournamentIds = tournaments.map((tournament) => tournament.id)

  if (tournamentIds.length === 0) {
    return EMPTY_WALLET
  }

  const { data: registrationsData, error: registrationsError } = await supabase
    .from("registrations")
    .select("id,tournament_id,participant_id")
    .in("tournament_id", tournamentIds)
    .returns<WalletRegistrationInput[]>()

  if (registrationsError) {
    throw new Error(registrationsError.message)
  }

  const registrations = registrationsData ?? []
  const registrationIds = registrations.map((registration) => registration.id)
  const participantIds = registrations.map(
    (registration) => registration.participant_id
  )

  if (registrationIds.length === 0) {
    return EMPTY_WALLET
  }

  const [participantsResult, paymentsResult] = await Promise.all([
    supabase
      .from("participants")
      .select("id,display_name")
      .in("id", participantIds)
      .returns<WalletParticipantInput[]>(),
    supabase
      .from("payments")
      .select("id,registration_id,amount,payment_method,status,paid_at,created_at")
      .in("registration_id", registrationIds)
      .returns<WalletPaymentInput[]>(),
  ])

  if (participantsResult.error) {
    throw new Error(participantsResult.error.message)
  }

  if (paymentsResult.error) {
    throw new Error(paymentsResult.error.message)
  }

  return buildOrganizerWallet({
    tournaments,
    registrations,
    participants: participantsResult.data ?? [],
    payments: paymentsResult.data ?? [],
  })
}
