import { describe, expect, it } from "vitest"

import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"

import {
  canCancelFromDashboard,
  canEditTournamentConfig,
  getCapacityForTournament,
  needsCashValidation,
  needsOnlineValidation,
} from "./management-rules"
import type { RegistrationView } from "./types"

const baseTournament: TournamentRow = {
  id: "tournament-id",
  title: "Torneo local",
  description: null,
  rules: null,
  province: "Madrid",
  address: "Polideportivo",
  date: "2999-01-01T10:00:00.000Z",
  registration_deadline: "2998-12-20T10:00:00.000Z",
  status: "published",
  has_categories: false,
  payment_method: "both",
  is_public: true,
  show_organizer_contact: true,
  min_participants: 1,
  max_participants: 32,
  entry_price: 10,
  participant_type: "individual",
  poster_url: null,
  prize_mode: "none",
  prizes: null,
}

const baseRegistrationView: RegistrationView = {
  registration: {
    id: "registration-id",
    tournament_id: "tournament-id",
    category_id: null,
    participant_id: "participant-id",
    status: "pending_cash_validation",
    payment_method: "cash",
    public_reference: "ABC123",
    created_at: "2026-01-01T10:00:00.000Z",
    cancelled_at: null,
  },
  participant: null,
  category: null,
  payment: null,
  amount: 10,
}

describe("management dashboard rules", () => {
  it("calculates total tournament capacity from categories", () => {
    const categories: CategoryRow[] = [
      {
        id: "category-a",
        tournament_id: "tournament-id",
        name: "Senior",
        price: 10,
        min_participants: 1,
        max_participants: 16,
        participant_type: "individual",
        start_at: null,
        address: null,
        prizes: null,
      },
      {
        id: "category-b",
        tournament_id: "tournament-id",
        name: "Junior",
        price: 8,
        min_participants: 1,
        max_participants: 8,
        participant_type: "individual",
        start_at: null,
        address: null,
        prizes: null,
      },
    ]

    expect(
      getCapacityForTournament(
        { ...baseTournament, has_categories: true, max_participants: null },
        categories
      )
    ).toBe(24)
  })

  it("keeps tournament capacity unlimited when any category is unlimited", () => {
    expect(
      getCapacityForTournament(
        { ...baseTournament, has_categories: true, max_participants: null },
        [
          {
            id: "category-a",
            tournament_id: "tournament-id",
            name: "Senior",
            price: 10,
            min_participants: 1,
            max_participants: null,
            participant_type: "individual",
            start_at: null,
            address: null,
            prizes: null,
          },
        ]
      )
    ).toBeNull()
  })

  it("detects pending cash and online validations only before tournament start", () => {
    expect(needsCashValidation(baseRegistrationView, baseTournament)).toBe(true)

    expect(
      needsOnlineValidation(
        {
          ...baseRegistrationView,
          registration: {
            ...baseRegistrationView.registration,
            payment_method: "online",
            status: "pending_online_payment",
          },
        },
        baseTournament
      )
    ).toBe(true)

    expect(
      needsCashValidation(baseRegistrationView, {
        ...baseTournament,
        date: "2020-01-01T10:00:00.000Z",
      })
    ).toBe(false)
  })

  it("only allows organizer cancellation while tournament and registration are active", () => {
    expect(canCancelFromDashboard("confirmed", baseTournament)).toBe(true)
    expect(canCancelFromDashboard("expired", baseTournament)).toBe(false)
    expect(
      canCancelFromDashboard("confirmed", {
        ...baseTournament,
        status: "finished",
      })
    ).toBe(false)
  })

  it("allows config editing while registrations are open or closed", () => {
    expect(canEditTournamentConfig(baseTournament)).toBe(true)
    expect(
      canEditTournamentConfig({ ...baseTournament, status: "closed" })
    ).toBe(true)
    expect(
      canEditTournamentConfig({ ...baseTournament, status: "finished" })
    ).toBe(false)
    expect(
      canEditTournamentConfig({ ...baseTournament, status: "cancelled" })
    ).toBe(false)
  })
})
