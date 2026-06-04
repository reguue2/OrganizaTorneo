import { describe, expect, it } from "vitest"

import {
  getExploreCapacityLabel,
  getExplorePriceLabel,
  getTournamentCategoriesSummary,
} from "./summaries"
import type { ExploreTournament, PublicTournamentCategory } from "./read-models"

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

  it("summarizes unlimited category capacity", () => {
    const tournament = {
      has_categories: true,
      categories: [
        { id: "a", name: "Senior", price: 12, min_participants: 1, max_participants: 16 },
        { id: "b", name: "Junior", price: 5, min_participants: 1, max_participants: null },
      ],
    } as ExploreTournament

    expect(getExploreCapacityLabel(tournament)).toBe(
      "2 categorías · cupos por categoría"
    )
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
