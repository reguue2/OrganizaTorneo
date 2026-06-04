import { describe, expect, it } from "vitest"

import {
  getExploreCapacityLabel,
  getExplorePriceLabel,
  getTournamentPriceSummary,
  getTournamentCategoriesSummary,
} from "./summaries"
import type {
  ExploreTournament,
  PublicTournamentCategory,
  PublicTournamentDetail,
} from "./read-models"

describe("tournament summaries", () => {
  it("summarizes explore price from categories", () => {
    const tournament = {
      has_categories: true,
      categories: [
        { id: "a", name: "Senior", price: 12, min_participants: 1, max_participants: 16 },
        { id: "b", name: "Junior", price: 5, min_participants: 1, max_participants: null },
      ],
    } as ExploreTournament

    expect(getExplorePriceLabel(tournament)).toBe("Desde 5€")
  })

  it("does not prefix free category prices with from", () => {
    const tournament = {
      has_categories: true,
      categories: [
        { id: "a", name: "Senior", price: 0, min_participants: 1, max_participants: 16 },
        { id: "b", name: "Junior", price: 5, min_participants: 1, max_participants: null },
      ],
    } as ExploreTournament

    expect(getExplorePriceLabel(tournament)).toBe("Gratis")
  })

  it("does not prefix free public category prices with from", () => {
    const tournament = {
      has_categories: true,
    } as PublicTournamentDetail
    const categories = [
      { id: "a", name: "Senior", price: 0 },
      { id: "b", name: "Junior", price: 8 },
    ] as PublicTournamentCategory[]

    expect(getTournamentPriceSummary(tournament, categories)).toBe("Gratis")
  })

  it("summarizes unlimited category capacity", () => {
    const tournament = {
      has_categories: true,
      categories: [
        { id: "a", name: "Senior", price: 12, min_participants: 1, max_participants: 16 },
        { id: "b", name: "Junior", price: 5, min_participants: 1, max_participants: null },
      ],
    } as ExploreTournament

    expect(getExploreCapacityLabel(tournament)).toBe("Plazas por categorías")
  })

  it("summarizes public category count", () => {
    const categories = [
      { id: "a", name: "Senior" },
      { id: "b", name: "Junior" },
    ] as PublicTournamentCategory[]

    expect(getTournamentCategoriesSummary(categories)).toBe(
      "2 categorías disponibles"
    )
  })
})
