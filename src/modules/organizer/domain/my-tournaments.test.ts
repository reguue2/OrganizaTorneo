import { describe, expect, it } from "vitest"

import {
  buildOrganizerTournamentsOverview,
  getOrganizerTournamentCapacity,
} from "./my-tournaments"
import type {
  OrganizerCategoryRow,
  OrganizerPaymentRow,
  OrganizerRegistrationRow,
  OrganizerTournamentRow,
} from "./my-tournaments"

const baseTournament: OrganizerTournamentRow = {
  id: "tournament-a",
  title: "Torneo local",
  date: "2999-01-01T10:00:00.000Z",
  registration_deadline: "2998-12-01T10:00:00.000Z",
  max_participants: 16,
  min_participants: 1,
  has_categories: false,
  entry_price: 10,
  is_public: true,
  status: "published",
  created_at: "2026-01-01T10:00:00.000Z",
  updated_at: "2026-01-02T10:00:00.000Z",
}

describe("organizer tournament overview", () => {
  it("summarizes registration metrics and revenue", () => {
    const registrations: OrganizerRegistrationRow[] = [
      {
        id: "registration-confirmed",
        tournament_id: "tournament-a",
        category_id: null,
        status: "confirmed",
        payment_method: "cash",
      },
      {
        id: "registration-cash",
        tournament_id: "tournament-a",
        category_id: null,
        status: "pending_cash_validation",
        payment_method: "cash",
      },
      {
        id: "registration-online",
        tournament_id: "tournament-a",
        category_id: null,
        status: "pending_online_payment",
        payment_method: "online",
      },
      {
        id: "registration-cancelled",
        tournament_id: "tournament-a",
        category_id: null,
        status: "cancelled",
        payment_method: "cash",
      },
    ]

    const payments: OrganizerPaymentRow[] = [
      {
        id: "payment-paid",
        registration_id: "registration-confirmed",
        amount: 12,
        status: "paid",
      },
      {
        id: "payment-pending",
        registration_id: "registration-online",
        amount: 12,
        status: "pending",
      },
    ]

    const overview = buildOrganizerTournamentsOverview({
      categories: [],
      payments,
      registrations,
      tournaments: [baseTournament],
    })

    expect(overview.totals).toMatchObject({
      totalTournaments: 1,
      totalActive: 1,
      totalConfirmed: 1,
      totalRevenue: 12,
    })
    expect(overview.activeTournaments[0]).toMatchObject({
      registrationsCount: 3,
      confirmedCount: 1,
      pendingCashCount: 1,
      pendingOnlineCount: 1,
      revenue: 12,
      capacity: 16,
      occupancyPercent: 19,
    })
  })

  it("groups tournaments by operational status", () => {
    const overview = buildOrganizerTournamentsOverview({
      categories: [],
      payments: [],
      registrations: [],
      tournaments: [
        baseTournament,
        { ...baseTournament, id: "tournament-draft", status: "draft" },
        { ...baseTournament, id: "tournament-finished", status: "finished" },
        { ...baseTournament, id: "tournament-cancelled", status: "cancelled" },
      ],
    })

    expect(overview.activeTournaments.map((tournament) => tournament.id)).toEqual([
      "tournament-a",
    ])
    expect(overview.unpublishedTournaments.map((tournament) => tournament.id)).toEqual([
      "tournament-draft",
    ])
    expect(overview.finishedTournaments.map((tournament) => tournament.id)).toEqual([
      "tournament-finished",
    ])
    expect(overview.cancelledTournaments.map((tournament) => tournament.id)).toEqual([
      "tournament-cancelled",
    ])
  })

  it("calculates category capacity and keeps unlimited categories unlimited", () => {
    const categories: OrganizerCategoryRow[] = [
      {
        id: "category-a",
        tournament_id: "tournament-a",
        name: "Senior",
        price: 10,
        min_participants: 1,
        max_participants: 8,
      },
      {
        id: "category-b",
        tournament_id: "tournament-a",
        name: "Junior",
        price: 8,
        min_participants: 1,
        max_participants: 6,
      },
    ]

    expect(
      getOrganizerTournamentCapacity(
        { ...baseTournament, has_categories: true, max_participants: null },
        categories
      )
    ).toBe(14)

    expect(
      getOrganizerTournamentCapacity(
        { ...baseTournament, has_categories: true, max_participants: null },
        [{ ...categories[0], max_participants: null }]
      )
    ).toBeNull()
  })
})
