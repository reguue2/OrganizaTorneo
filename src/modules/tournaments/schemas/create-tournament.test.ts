import { describe, expect, it } from "vitest"

import { parseCreateTournamentFormData } from "./create-tournament"

function baseFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const values = {
    title: "Torneo local",
    description: "",
    province: "Madrid",
    address: "Polideportivo",
    date: "2999-01-01T10:00",
    registration_deadline: "2998-12-20T10:00",
    is_public: "true",
    has_categories: "false",
    participant_type: "individual",
    min_participants: "1",
    max_participants: "32",
    payment_method: "cash",
    prize_mode: "none",
    prizes: "",
    rules: "",
    entry_price: "10",
    categories_json: "[]",
    ...overrides,
  }

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return formData
}

describe("create tournament schema", () => {
  it("parses a tournament without categories", () => {
    const result = parseCreateTournamentFormData(baseFormData())

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data).toMatchObject({
      has_categories: false,
      participant_type: "individual",
      entry_price: 10,
      max_participants: 32,
    })
  })

  it("parses a tournament with categories and ignores global entry price", () => {
    const result = parseCreateTournamentFormData(
      baseFormData({
        has_categories: "true",
        participant_type: "",
        entry_price: "invalid",
        categories_json: JSON.stringify([
          {
            name: "Senior",
            participant_type: "individual",
            price: 12,
            min_participants: 1,
            max_participants: 16,
            start_at: null,
            address: null,
            prizes: null,
          },
          {
            name: "Junior",
            participant_type: "individual",
            price: 8,
            min_participants: 1,
            max_participants: null,
            start_at: null,
            address: null,
            prizes: null,
          },
        ]),
      })
    )

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.has_categories).toBe(true)
    expect(result.data.entry_price).toBe(0)
    expect(result.data.categories).toHaveLength(2)
  })

  it("rejects a registration deadline after tournament date", () => {
    const result = parseCreateTournamentFormData(
      baseFormData({
        date: "2999-01-01T10:00",
        registration_deadline: "2999-01-02T10:00",
      })
    )

    expect(result).toEqual({
      success: false,
      error: "La fecha límite no puede ser posterior al torneo.",
    })
  })

  it("accepts tournaments with a single category", () => {
    const result = parseCreateTournamentFormData(
      baseFormData({
        has_categories: "true",
        categories_json: JSON.stringify([
          {
            name: "Senior",
            participant_type: "individual",
            price: 12,
            min_participants: 1,
            max_participants: 16,
            start_at: null,
            address: null,
            prizes: null,
          },
        ]),
      })
    )

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.categories).toHaveLength(1)
  })

  it("rejects per-category prizes when categories have no prizes", () => {
    const result = parseCreateTournamentFormData(
      baseFormData({
        has_categories: "true",
        prize_mode: "per_category",
        categories_json: JSON.stringify([
          {
            name: "Senior",
            participant_type: "individual",
            price: 12,
            min_participants: 1,
            max_participants: 16,
            start_at: null,
            address: null,
            prizes: "",
          },
          {
            name: "Junior",
            participant_type: "individual",
            price: 8,
            min_participants: 1,
            max_participants: null,
            start_at: null,
            address: null,
            prizes: "Trofeo",
          },
        ]),
      })
    )

    expect(result).toEqual({
      success: false,
      error: "Faltan los premios en la categoría “Senior”.",
    })
  })
})
