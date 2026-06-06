import type {
  RegistrationPaymentMethod,
  RegistrationStatus,
  TournamentStatus,
} from "./management"

export type OrganizerTournamentRow = {
  id: string
  title: string
  date: string | null
  registration_deadline: string | null
  max_participants: number | null
  min_participants: number
  has_categories: boolean
  entry_price: number
  is_public: boolean | null
  status: TournamentStatus | null
  created_at: string | null
  updated_at: string | null
}

export type OrganizerCategoryRow = {
  id: string
  tournament_id: string
  name: string
  price: number
  min_participants: number
  max_participants: number | null
}

export type OrganizerRegistrationRow = {
  id: string
  tournament_id: string
  category_id: string | null
  status: RegistrationStatus | null
  payment_method: RegistrationPaymentMethod
}

export type OrganizerPaymentRow = {
  id: string
  registration_id: string
  amount: number
  status: "pending" | "paid" | "refunded" | null
}

export type OrganizerTournamentMetrics = {
  registrationsCount: number
  confirmedCount: number
  pendingCashCount: number
  pendingOnlineCount: number
  revenue: number
  capacity: number | null
  occupancyPercent: number | null
}

export type OrganizerTournamentView = OrganizerTournamentRow & OrganizerTournamentMetrics

export type OrganizerTournamentOperationalState =
  | "unpublished"
  | "registrations_open"
  | "registrations_closed"
  | "finished"
  | "cancelled"

export type OrganizerTournamentTotals = {
  totalTournaments: number
  totalActive: number
  totalConfirmed: number
  totalRevenue: number
}

export type OrganizerTournamentsOverview = {
  allTournaments: OrganizerTournamentView[]
  activeTournaments: OrganizerTournamentView[]
  unpublishedTournaments: OrganizerTournamentView[]
  finishedTournaments: OrganizerTournamentView[]
  cancelledTournaments: OrganizerTournamentView[]
  totals: OrganizerTournamentTotals
}

export function getOrganizerTournamentOperationalState(
  tournament: Pick<
    OrganizerTournamentRow,
    "date" | "registration_deadline" | "status"
  >
): OrganizerTournamentOperationalState {
  if (tournament.status === "cancelled") return "cancelled"
  if (tournament.status === "finished") return "finished"
  if (tournament.status === "draft" || !tournament.status) return "unpublished"

  const tournamentDate = tournament.date ? new Date(tournament.date) : null
  if (
    tournamentDate &&
    !Number.isNaN(tournamentDate.getTime()) &&
    tournamentDate <= new Date()
  ) {
    return "finished"
  }

  if (tournament.status === "closed") return "registrations_closed"

  const registrationDeadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : null
  if (
    registrationDeadline &&
    !Number.isNaN(registrationDeadline.getTime()) &&
    registrationDeadline <= new Date()
  ) {
    return "registrations_closed"
  }

  return "registrations_open"
}

function sortByDateAsc(a: OrganizerTournamentView, b: OrganizerTournamentView) {
  const aTime = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER
  const bTime = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER
  return aTime - bTime
}

function sortByDateDesc(a: OrganizerTournamentView, b: OrganizerTournamentView) {
  const aTime = a.date ? new Date(a.date).getTime() : 0
  const bTime = b.date ? new Date(b.date).getTime() : 0
  return bTime - aTime
}

function sortByUpdatedDesc(a: OrganizerTournamentView, b: OrganizerTournamentView) {
  const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0
  const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0
  return bTime - aTime
}

export function getOrganizerTournamentCapacity(
  tournament: OrganizerTournamentRow,
  categories: OrganizerCategoryRow[]
) {
  if (!tournament.has_categories) {
    return tournament.max_participants
  }

  if (categories.length === 0) return null
  if (categories.some((category) => category.max_participants === null)) return null

  return categories.reduce((acc, category) => acc + (category.max_participants ?? 0), 0)
}

export function isInactiveOrganizerRegistration(status: RegistrationStatus | null) {
  return status === "cancelled" || status === "expired"
}

export function isConfirmedOrganizerRegistration(status: RegistrationStatus | null) {
  return status === "confirmed"
}

export function isPendingCashOrganizerRegistration(
  registration: OrganizerRegistrationRow
) {
  return (
    registration.payment_method === "cash" &&
    registration.status === "pending_cash_validation"
  )
}

export function isPendingOnlineOrganizerRegistration(
  registration: OrganizerRegistrationRow
) {
  return (
    registration.payment_method === "online" &&
    registration.status === "pending_online_payment"
  )
}

export function buildOrganizerTournamentsOverview({
  categories,
  payments,
  registrations,
  tournaments,
}: {
  categories: OrganizerCategoryRow[]
  payments: OrganizerPaymentRow[]
  registrations: OrganizerRegistrationRow[]
  tournaments: OrganizerTournamentRow[]
}): OrganizerTournamentsOverview {
  const tournamentMap = new Map(tournaments.map((tournament) => [tournament.id, tournament]))
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  const categoriesByTournament = new Map<string, OrganizerCategoryRow[]>()
  for (const category of categories) {
    const current = categoriesByTournament.get(category.tournament_id) ?? []
    current.push(category)
    categoriesByTournament.set(category.tournament_id, current)
  }

  const paymentsByRegistration = new Map<string, OrganizerPaymentRow[]>()
  for (const payment of payments) {
    const current = paymentsByRegistration.get(payment.registration_id) ?? []
    current.push(payment)
    paymentsByRegistration.set(payment.registration_id, current)
  }

  const metricsMap = new Map<string, OrganizerTournamentMetrics>()
  for (const tournament of tournaments) {
    const tournamentCategories = categoriesByTournament.get(tournament.id) ?? []
    const capacity = getOrganizerTournamentCapacity(tournament, tournamentCategories)

    metricsMap.set(tournament.id, {
      registrationsCount: 0,
      confirmedCount: 0,
      pendingCashCount: 0,
      pendingOnlineCount: 0,
      revenue: 0,
      capacity,
      occupancyPercent: null,
    })
  }

  for (const registration of registrations) {
    const category = registration.category_id ? categoryMap.get(registration.category_id) : null
    const tournamentId = registration.tournament_id ?? category?.tournament_id ?? null

    if (!tournamentId) continue

    const tournament = tournamentMap.get(tournamentId)
    const metrics = metricsMap.get(tournamentId)

    if (!tournament || !metrics) continue

    if (!isInactiveOrganizerRegistration(registration.status)) {
      metrics.registrationsCount += 1
    }

    if (isConfirmedOrganizerRegistration(registration.status)) {
      metrics.confirmedCount += 1
    }

    if (isPendingCashOrganizerRegistration(registration)) {
      metrics.pendingCashCount += 1
    }

    if (isPendingOnlineOrganizerRegistration(registration)) {
      metrics.pendingOnlineCount += 1
    }

    const paymentList = paymentsByRegistration.get(registration.id) ?? []
    for (const payment of paymentList) {
      if (payment.status === "paid") {
        const amount = Number(payment.amount ?? 0)
        if (Number.isFinite(amount)) {
          metrics.revenue += amount
        }
      }
    }
  }

  const allTournaments = tournaments.map((tournament) => {
    const metrics = metricsMap.get(tournament.id)

    if (!metrics) {
      return {
        ...tournament,
        registrationsCount: 0,
        confirmedCount: 0,
        pendingCashCount: 0,
        pendingOnlineCount: 0,
        revenue: 0,
        capacity: null,
        occupancyPercent: null,
      }
    }

    const occupancyPercent =
      metrics.capacity && metrics.capacity > 0
        ? Math.round((metrics.registrationsCount / metrics.capacity) * 100)
        : null

    return {
      ...tournament,
      ...metrics,
      occupancyPercent,
    }
  })

  const activeTournaments = allTournaments
    .filter((tournament) => {
      const state = getOrganizerTournamentOperationalState(tournament)
      return state === "registrations_open" || state === "registrations_closed"
    })
    .sort(sortByDateAsc)

  const unpublishedTournaments = allTournaments
    .filter(
      (tournament) =>
        getOrganizerTournamentOperationalState(tournament) === "unpublished"
    )
    .sort(sortByUpdatedDesc)

  const finishedTournaments = allTournaments
    .filter(
      (tournament) =>
        getOrganizerTournamentOperationalState(tournament) === "finished"
    )
    .sort(sortByDateDesc)

  const cancelledTournaments = allTournaments
    .filter(
      (tournament) =>
        getOrganizerTournamentOperationalState(tournament) === "cancelled"
    )
    .sort(sortByUpdatedDesc)

  return {
    allTournaments,
    activeTournaments,
    unpublishedTournaments,
    finishedTournaments,
    cancelledTournaments,
    totals: {
      totalTournaments: allTournaments.length,
      totalActive: activeTournaments.length,
      totalConfirmed: allTournaments.reduce(
        (acc, tournament) => acc + tournament.confirmedCount,
        0
      ),
      totalRevenue: allTournaments.reduce((acc, tournament) => acc + tournament.revenue, 0),
    },
  }
}
