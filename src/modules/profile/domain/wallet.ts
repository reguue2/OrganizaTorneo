export type WalletPaymentMethod = "cash" | "online"
export type WalletPaymentStatus = "pending" | "paid" | "refunded"

export type WalletPaymentInput = {
  id: string
  registration_id: string
  amount: number
  payment_method: WalletPaymentMethod | null
  status: WalletPaymentStatus | null
  paid_at: string | null
  created_at: string | null
}

export type WalletRegistrationInput = {
  id: string
  tournament_id: string | null
  participant_id: string
}

export type WalletTournamentInput = {
  id: string
  title: string
}

export type WalletParticipantInput = {
  id: string
  display_name: string
}

export type WalletMovement = {
  id: string
  tournamentId: string | null
  tournamentTitle: string
  participantName: string
  amount: number
  method: WalletPaymentMethod | null
  status: WalletPaymentStatus | null
  date: string | null
}

export type WalletTournamentBreakdown = {
  tournamentId: string
  tournamentTitle: string
  online: number
  cash: number
  total: number
}

export type OrganizerWallet = {
  /** Online payments already marked as paid (the only balance a payout could draw from). */
  availableOnline: number
  /** Cash collected in hand by the organizer; informational, the app never holds it. */
  collectedCash: number
  /** Online payments started but not yet confirmed as paid. */
  pendingOnline: number
  /** availableOnline + collectedCash. */
  totalCollected: number
  currency: "EUR"
  movements: WalletMovement[]
  byTournament: WalletTournamentBreakdown[]
}

const UNKNOWN_TOURNAMENT = "Torneo sin asignar"
const UNKNOWN_PARTICIPANT = "Participante"

function movementTimestamp(movement: WalletMovement): number {
  if (!movement.date) return 0
  const time = new Date(movement.date).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function buildOrganizerWallet({
  payments,
  registrations,
  tournaments,
  participants,
}: {
  payments: WalletPaymentInput[]
  registrations: WalletRegistrationInput[]
  tournaments: WalletTournamentInput[]
  participants: WalletParticipantInput[]
}): OrganizerWallet {
  const registrationsById = new Map(
    registrations.map((registration) => [registration.id, registration])
  )
  const tournamentsById = new Map(
    tournaments.map((tournament) => [tournament.id, tournament])
  )
  const participantsById = new Map(
    participants.map((participant) => [participant.id, participant])
  )

  let availableOnline = 0
  let collectedCash = 0
  let pendingOnline = 0

  const breakdownByTournament = new Map<string, WalletTournamentBreakdown>()
  const movements: WalletMovement[] = []

  for (const payment of payments) {
    if (payment.status === "refunded") continue

    const registration = registrationsById.get(payment.registration_id)
    const tournament = registration?.tournament_id
      ? tournamentsById.get(registration.tournament_id)
      : undefined
    const participant = registration
      ? participantsById.get(registration.participant_id)
      : undefined

    const amount = Number.isFinite(payment.amount) ? payment.amount : 0
    const isPaid = payment.status === "paid"
    const isPending = payment.status === "pending"

    if (isPaid && payment.payment_method === "online") {
      availableOnline += amount
    } else if (isPaid && payment.payment_method === "cash") {
      collectedCash += amount
    } else if (isPending && payment.payment_method === "online") {
      pendingOnline += amount
    }

    if (isPaid && tournament) {
      const current = breakdownByTournament.get(tournament.id) ?? {
        tournamentId: tournament.id,
        tournamentTitle: tournament.title,
        online: 0,
        cash: 0,
        total: 0,
      }

      if (payment.payment_method === "online") current.online += amount
      if (payment.payment_method === "cash") current.cash += amount
      current.total += amount

      breakdownByTournament.set(tournament.id, current)
    }

    movements.push({
      id: payment.id,
      tournamentId: tournament?.id ?? registration?.tournament_id ?? null,
      tournamentTitle: tournament?.title ?? UNKNOWN_TOURNAMENT,
      participantName: participant?.display_name ?? UNKNOWN_PARTICIPANT,
      amount,
      method: payment.payment_method,
      status: payment.status,
      date: payment.paid_at ?? payment.created_at,
    })
  }

  movements.sort((a, b) => movementTimestamp(b) - movementTimestamp(a))

  const byTournament = [...breakdownByTournament.values()].sort(
    (a, b) => b.total - a.total
  )

  return {
    availableOnline,
    collectedCash,
    pendingOnline,
    totalCollected: availableOnline + collectedCash,
    currency: "EUR",
    movements,
    byTournament,
  }
}
