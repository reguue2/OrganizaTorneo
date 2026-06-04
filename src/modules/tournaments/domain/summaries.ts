import { formatMoney } from "./rules"
import type {
  ExploreTournament,
  ParticipantType,
  PublicTournamentCategory,
  PublicTournamentDetail,
} from "./read-models"

export function getParticipantTypeLabel(value: ParticipantType | null) {
  if (value === "team") return "Equipos"
  if (value === "individual") return "Individual"
  return "Por definir"
}

export function getExplorePriceLabel(tournament: ExploreTournament) {
  if (!tournament.has_categories) {
    return formatMoney(tournament.entry_price)
  }

  const prices = (tournament.categories ?? [])
    .map((category) => Number(category.price))
    .filter((price) => Number.isFinite(price))

  if (prices.length === 0) return "Por categoría"

  const minPrice = Math.min(...prices)
  if (minPrice === 0) return "Gratis"

  return `Desde ${formatMoney(minPrice)}`
}

export function getExploreCapacityLabel(tournament: ExploreTournament) {
  if (!tournament.has_categories) {
    return tournament.max_participants === null
      ? "Sin límite de plazas"
      : `${tournament.max_participants} plazas`
  }

  return "Plazas por categorías"
}

export function getExploreStructureLabel(tournament: ExploreTournament) {
  if (!tournament.has_categories) {
    return "Inscripción general"
  }

  const categories = tournament.categories ?? []
  if (categories.length === 0) return "Con categorías"
  if (categories.length === 1) return `1 categoría: ${categories[0].name}`

  return `${categories.length} categorías disponibles`
}

export function getTournamentPriceSummary(
  tournament: PublicTournamentDetail,
  categories: PublicTournamentCategory[]
) {
  if (!tournament.has_categories) {
    return formatMoney(tournament.entry_price)
  }

  const prices = categories
    .map((category) => Number(category.price))
    .filter((price) => Number.isFinite(price))

  if (prices.length === 0) return "Según categoría"

  const minPrice = Math.min(...prices)
  if (minPrice === 0) return "Gratis"

  return `Desde ${formatMoney(minPrice)}`
}

export function getTournamentCapacitySummary(
  tournament: PublicTournamentDetail,
  categories: PublicTournamentCategory[]
) {
  if (!tournament.has_categories) {
    return tournament.max_participants === null
      ? "Sin límite"
      : `${tournament.max_participants} plazas`
  }

  if (categories.length === 0) return "Plazas por categoría"

  const totalMax = categories.reduce((acc, category) => {
    if (category.max_participants === null) return acc
    return acc + category.max_participants
  }, 0)

  const hasUnlimited = categories.some(
    (category) => category.max_participants === null
  )

  if (hasUnlimited) return "Plazas por categoría"

  return `${totalMax} plazas`
}

export function getTournamentCategoriesSummary(
  categories: PublicTournamentCategory[]
) {
  if (categories.length === 0) return "No definidas"
  if (categories.length === 1) return categories[0].name
  return `${categories.length} categorías disponibles`
}
