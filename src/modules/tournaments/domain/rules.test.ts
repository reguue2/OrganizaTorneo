import { describe, expect, it } from "vitest"

import {
  formatDate,
  formatMoney,
  getRegistrationState,
  validateTournamentForPublication,
} from "./rules"

describe("tournament domain", () => {
  it("formats money for public UI", () => {
    expect(formatMoney(0)).toBe("Gratis")
    expect(formatMoney(12)).toBe("12€")
    expect(formatMoney(12.5)).toBe("12.50€")
    expect(formatMoney(null)).toBe("Gratis")
  })

  it("formats dates with time when requested", () => {
    const formatted = formatDate("2999-01-01T10:30:00", {
      withTime: true,
      withWeekday: true,
    })

    expect(formatted).toBe("martes, 1 de enero de 2999, 10:30")
  })

  it("keeps public date formatting without time by default", () => {
    expect(formatDate("2999-01-01T10:30:00")).not.toContain("10:30")
  })

  it("blocks registrations when tournament is closed", () => {
    expect(
      getRegistrationState({
        status: "closed",
        date: "2999-01-10T00:00:00.000Z",
        registration_deadline: "2999-01-01T00:00:00.000Z",
        payment_method: "cash",
        is_public: true,
      })
    ).toMatchObject({
      canJoin: false,
      buttonLabel: "Inscripción cerrada",
    })
  })

  it("treats a tournament with a past date as finished", () => {
    expect(
      getRegistrationState({
        status: "published",
        date: "2020-01-01T00:00:00.000Z",
        registration_deadline: "2999-01-01T00:00:00.000Z",
        payment_method: "cash",
        is_public: true,
      })
    ).toMatchObject({
      canJoin: false,
      title: "Torneo finalizado",
    })
  })

  it("validates required fields before publication", () => {
    const result = validateTournamentForPublication(
      {
        title: "",
        province: "",
        address: "",
        date: null,
        registration_deadline: null,
        payment_method: null,
        has_categories: false,
        min_participants: 0,
        max_participants: null,
        entry_price: -1,
        prize_mode: "none",
        prizes: null,
      },
      []
    )

    expect(result.canPublish).toBe(false)
    expect(result.issues).toContain("Falta configurar el método de pago.")
    expect(result.issues).toContain("Falta indicar la fecha del torneo.")
  })

  it("requires at least one category before publication", () => {
    const result = validateTournamentForPublication(
      {
        title: "Torneo local",
        province: "Madrid",
        address: "Polideportivo",
        date: "2999-01-01T10:00:00.000Z",
        registration_deadline: "2998-12-20T10:00:00.000Z",
        payment_method: "cash",
        has_categories: true,
        min_participants: 1,
        max_participants: null,
        entry_price: 0,
        prize_mode: "none",
        prizes: null,
      },
      []
    )

    expect(result.canPublish).toBe(false)
    expect(result.issues).toContain("Debes crear al menos 2 categorías.")
  })
})
