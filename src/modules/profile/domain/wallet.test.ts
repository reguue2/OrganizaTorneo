import { describe, expect, it } from "vitest"

import { buildOrganizerWallet } from "./wallet"

const tournaments = [
  { id: "t1", title: "Liga local" },
  { id: "t2", title: "Copa verano" },
]

const participants = [
  { id: "p1", display_name: "Ana" },
  { id: "p2", display_name: "Luis" },
  { id: "p3", display_name: "Marta" },
]

const registrations = [
  { id: "r1", tournament_id: "t1", participant_id: "p1" },
  { id: "r2", tournament_id: "t1", participant_id: "p2" },
  { id: "r3", tournament_id: "t2", participant_id: "p3" },
]

describe("buildOrganizerWallet", () => {
  it("splits online and cash, and ignores refunds", () => {
    const wallet = buildOrganizerWallet({
      tournaments,
      participants,
      registrations,
      payments: [
        {
          id: "pay1",
          registration_id: "r1",
          amount: 10,
          payment_method: "online",
          status: "paid",
          paid_at: "2026-06-01T10:00:00Z",
          created_at: "2026-06-01T10:00:00Z",
        },
        {
          id: "pay2",
          registration_id: "r2",
          amount: 15,
          payment_method: "cash",
          status: "paid",
          paid_at: "2026-06-02T10:00:00Z",
          created_at: "2026-06-02T10:00:00Z",
        },
        {
          id: "pay3",
          registration_id: "r3",
          amount: 20,
          payment_method: "online",
          status: "pending",
          paid_at: null,
          created_at: "2026-06-03T10:00:00Z",
        },
        {
          id: "pay4",
          registration_id: "r3",
          amount: 99,
          payment_method: "online",
          status: "refunded",
          paid_at: null,
          created_at: "2026-06-04T10:00:00Z",
        },
      ],
    })

    expect(wallet.availableOnline).toBe(10)
    expect(wallet.collectedCash).toBe(15)
    expect(wallet.pendingOnline).toBe(20)
    expect(wallet.totalCollected).toBe(25)
    // refunded payment is excluded from movements
    expect(wallet.movements).toHaveLength(3)
  })

  it("orders movements by date descending and resolves names", () => {
    const wallet = buildOrganizerWallet({
      tournaments,
      participants,
      registrations,
      payments: [
        {
          id: "pay1",
          registration_id: "r1",
          amount: 10,
          payment_method: "online",
          status: "paid",
          paid_at: "2026-06-01T10:00:00Z",
          created_at: "2026-06-01T10:00:00Z",
        },
        {
          id: "pay2",
          registration_id: "r2",
          amount: 15,
          payment_method: "cash",
          status: "paid",
          paid_at: "2026-06-05T10:00:00Z",
          created_at: "2026-06-05T10:00:00Z",
        },
      ],
    })

    expect(wallet.movements[0].id).toBe("pay2")
    expect(wallet.movements[0].participantName).toBe("Luis")
    expect(wallet.movements[0].tournamentTitle).toBe("Liga local")
  })

  it("aggregates a per-tournament breakdown from paid payments only", () => {
    const wallet = buildOrganizerWallet({
      tournaments,
      participants,
      registrations,
      payments: [
        {
          id: "pay1",
          registration_id: "r1",
          amount: 10,
          payment_method: "online",
          status: "paid",
          paid_at: "2026-06-01T10:00:00Z",
          created_at: "2026-06-01T10:00:00Z",
        },
        {
          id: "pay2",
          registration_id: "r2",
          amount: 15,
          payment_method: "cash",
          status: "paid",
          paid_at: "2026-06-02T10:00:00Z",
          created_at: "2026-06-02T10:00:00Z",
        },
        {
          id: "pay3",
          registration_id: "r3",
          amount: 30,
          payment_method: "online",
          status: "pending",
          paid_at: null,
          created_at: "2026-06-03T10:00:00Z",
        },
      ],
    })

    expect(wallet.byTournament).toHaveLength(1)
    expect(wallet.byTournament[0]).toMatchObject({
      tournamentId: "t1",
      online: 10,
      cash: 15,
      total: 25,
    })
  })
})
