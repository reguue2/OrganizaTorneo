import { useMemo } from "react"

import type { PaymentRow } from "@/modules/organizer/domain"

import {
  getCapacityForTournament,
  getRegistrationAmount,
  isActiveRegistration,
  isConfirmedRegistration,
  needsCashValidation,
  needsOnlineValidation,
} from "./display"
import type { ManageDashboardProps, RegistrationView } from "./types"

export function useDashboardDerivedData({
  categories,
  participants,
  payments,
  registrations,
  tournament,
}: Omit<ManageDashboardProps, "brackets">) {
  const participantMap = useMemo(
    () => new Map(participants.map((participant) => [participant.id, participant])),
    [participants]
  )

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const paymentsByRegistration = useMemo(() => {
    const map = new Map<string, PaymentRow[]>()

    for (const payment of payments) {
      const current = map.get(payment.registration_id) ?? []
      current.push(payment)
      map.set(payment.registration_id, current)
    }

    return map
  }, [payments])

  const registrationViews = useMemo<RegistrationView[]>(() => {
    return registrations
      .map((registration) => {
        const participant = participantMap.get(registration.participant_id) ?? null
        const category = registration.category_id
          ? categoryMap.get(registration.category_id) ?? null
          : null

        const paymentList = paymentsByRegistration.get(registration.id) ?? []
        const latestPayment =
          [...paymentList].sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
            return bTime - aTime
          })[0] ?? null

        return {
          registration,
          participant,
          category,
          payment: latestPayment,
          amount: getRegistrationAmount(registration, tournament, category),
        }
      })
      .sort((a, b) => {
        const pendingDifference =
          Number(b.registration.status === "pending_cash_validation") -
          Number(a.registration.status === "pending_cash_validation")

        if (pendingDifference !== 0) return pendingDifference

        const aTime = a.registration.created_at
          ? new Date(a.registration.created_at).getTime()
          : 0
        const bTime = b.registration.created_at
          ? new Date(b.registration.created_at).getTime()
          : 0
        return bTime - aTime
      })
  }, [registrations, participantMap, categoryMap, paymentsByRegistration, tournament])

  const activeRegistrations = registrationViews.filter((view) =>
    isActiveRegistration(view.registration.status)
  )

  const confirmedRegistrations = activeRegistrations.filter((view) =>
    isConfirmedRegistration(view.registration.status)
  )

  const pendingCashValidations = activeRegistrations.filter((view) =>
    needsCashValidation(view, tournament)
  )

  const pendingOnlinePayments = activeRegistrations.filter((view) =>
    needsOnlineValidation(view, tournament)
  )

  const cancelledRegistrations = registrationViews.filter(
    (view) => view.registration.status === "cancelled"
  )

  const revenue = registrationViews.reduce((acc, view) => {
    if (view.payment?.status === "paid") {
      return acc + Number(view.payment.amount ?? 0)
    }
    return acc
  }, 0)

  const totalCapacity = getCapacityForTournament(tournament, categories)
  const remainingSpots =
    totalCapacity === null ? null : Math.max(totalCapacity - activeRegistrations.length, 0)

  const groupedViews = useMemo(() => {
    if (!tournament.has_categories) {
      return [
        {
          id: "general",
          name: "Inscripciones del torneo",
          capacity: tournament.max_participants,
          views: registrationViews,
        },
      ]
    }

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      capacity: category.max_participants,
      views: registrationViews.filter((view) => view.registration.category_id === category.id),
    }))
  }, [tournament, categories, registrationViews])

  return {
    activeRegistrations,
    cancelledRegistrations,
    confirmedRegistrations,
    groupedViews,
    pendingCashValidations,
    pendingOnlinePayments,
    remainingSpots,
    revenue,
    totalCapacity,
  }
}
