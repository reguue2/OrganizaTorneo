import {
  MIN_TOURNAMENT_CATEGORIES,
  MIN_TOURNAMENT_CATEGORIES_ERROR,
} from "./constants"

export type TournamentStatus =
  | "draft"
  | "published"
  | "closed"
  | "finished"
  | "cancelled"
  | null

export type TournamentPaymentMethod = "cash" | "online" | "both" | null
export type PrizeMode = "none" | "global" | "per_category"
export type PublicTournamentStatusState =
  | "open"
  | "closed"
  | "finished"
  | "cancelled"

export type PublicTournamentLike = {
  status: TournamentStatus
  date: string | null
  registration_deadline: string | null
  payment_method: TournamentPaymentMethod
  is_public: boolean | null
}

export type PublicationTournamentLike = {
  title: string
  province: string | null
  address: string | null
  date: string | null
  registration_deadline: string | null
  payment_method: TournamentPaymentMethod
  has_categories: boolean
  min_participants: number
  max_participants: number | null
  entry_price: number
  prize_mode: PrizeMode
  prizes: string | null
}

export type PublicationCategoryLike = {
  id: string
  name: string
  price: number
  min_participants: number
  max_participants: number | null
  prizes: string | null
}

export function formatMoney(value: number | null | undefined) {
  const amount = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(amount)) return "—"
  if (amount === 0) return "Gratis"

  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.00$/, "")

  return `${text}€`
}

type FormatDateOptions = {
  withWeekday?: boolean
  withTime?: boolean
}

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const

const weekdayNames = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const

type DateParts = {
  date: Date
  day: number
  hours: number
  minutes: number
  monthIndex: number
  year: number
}

function normalizeFormatDateOptions(
  options: boolean | FormatDateOptions
): FormatDateOptions {
  return typeof options === "boolean" ? { withWeekday: options } : options
}

function getDateParts(value: string): DateParts | null {
  const localDateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/.exec(
    value.trim()
  )

  if (localDateTimeMatch) {
    const [, yearText, monthText, dayText, hoursText = "00", minutesText = "00"] =
      localDateTimeMatch
    const year = Number(yearText)
    const monthIndex = Number(monthText) - 1
    const day = Number(dayText)
    const hours = Number(hoursText)
    const minutes = Number(minutesText)
    const date = new Date(year, monthIndex, day, hours, minutes)

    if (
      date.getFullYear() === year &&
      date.getMonth() === monthIndex &&
      date.getDate() === day &&
      date.getHours() === hours &&
      date.getMinutes() === minutes
    ) {
      return { date, day, hours, minutes, monthIndex, year }
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return {
    date,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    monthIndex: date.getMonth(),
    year: date.getFullYear(),
  }
}

export function formatDate(
  value: string | null,
  options: boolean | FormatDateOptions = {}
) {
  if (!value) return "Por definir"

  const parts = getDateParts(value)
  if (!parts) return "Por definir"

  const { withTime = false, withWeekday = false } =
    normalizeFormatDateOptions(options)
  const dateText = `${parts.day} de ${monthNames[parts.monthIndex]} de ${parts.year}`
  const weekdayText = withWeekday ? `${weekdayNames[parts.date.getDay()]}, ` : ""
  const timeText = withTime
    ? `, ${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}`
    : ""

  return `${weekdayText}${dateText}${timeText}`
}

export function paymentMethodLabel(method: TournamentPaymentMethod) {
  if (!method) return "Por definir"
  if (method === "cash") return "Solo pagos en efectivo"
  if (method === "online") return "Solo pagos online"
  return "Efectivo y online"
}

export function getPublicVisibilityLabel(isPublic: boolean | null | undefined) {
  if (isPublic ?? true) {
    return "Torneo público"
  }

  return "Oculto del explorador. Acceso directo por enlace"
}

export function getExploreStatus(
  tournament: Pick<PublicTournamentLike, "date" | "status" | "registration_deadline">
) {
  const tournamentDate = tournament.date ? new Date(tournament.date) : null
  if (
    tournament.status === "finished" ||
    (tournamentDate &&
      !Number.isNaN(tournamentDate.getTime()) &&
      tournamentDate <= new Date())
  ) {
    return {
      label: "Finalizado",
      state: "finished" as const,
    }
  }

  if (tournament.status === "cancelled") {
    return {
      label: "Cancelado",
      state: "cancelled" as const,
    }
  }

  if (tournament.status === "closed") {
    return {
      label: "Cerrado",
      state: "closed" as const,
    }
  }

  const deadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : null

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date()) {
    return {
      label: "Cerrado",
      state: "closed" as const,
    }
  }

  return {
    label: "Abierto",
    state: "open" as const,
  }
}

export function getSidebarStatus(
  tournament: Pick<PublicTournamentLike, "date" | "status" | "registration_deadline">
) {
  const tournamentDate = tournament.date ? new Date(tournament.date) : null
  if (
    tournament.status === "finished" ||
    (tournamentDate &&
      !Number.isNaN(tournamentDate.getTime()) &&
      tournamentDate <= new Date())
  ) {
    return {
      label: "Finalizado",
      state: "finished" as const,
    }
  }

  if (tournament.status === "cancelled") {
    return {
      label: "Cancelado",
      state: "cancelled" as const,
    }
  }

  if (tournament.status === "closed") {
    return {
      label: "Cerrado",
      state: "closed" as const,
    }
  }

  const deadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : null

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date()) {
    return {
      label: "Inscripción cerrada",
      state: "closed" as const,
    }
  }

  return {
    label: "Inscripción abierta",
    state: "open" as const,
  }
}

export function getRegistrationState(tournament: PublicTournamentLike) {
  if (tournament.status === "cancelled") {
    return {
      canJoin: false,
      title: "Torneo cancelado",
      message: "Este torneo ha sido cancelado.",
      buttonLabel: "Inscripción no disponible",
    }
  }

  const tournamentDate = tournament.date ? new Date(tournament.date) : null
  if (
    tournament.status === "finished" ||
    (tournamentDate &&
      !Number.isNaN(tournamentDate.getTime()) &&
      tournamentDate <= new Date())
  ) {
    return {
      canJoin: false,
      title: "Torneo finalizado",
      message: "Este torneo ya ha finalizado.",
      buttonLabel: "Inscripción no disponible",
    }
  }

  if (tournament.status === "closed") {
    return {
      canJoin: false,
      title: "Inscripciones cerradas",
      message: "Las inscripciones están cerradas.",
      buttonLabel: "Inscripción cerrada",
    }
  }

  const deadline = tournament.registration_deadline
    ? new Date(tournament.registration_deadline)
    : null

  if (deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date()) {
    return {
      canJoin: false,
      title: "Fuera de plazo",
      message: "La fecha límite de inscripción ya ha pasado.",
      buttonLabel: "Fuera de plazo",
    }
  }

  if (!tournament.payment_method) {
    return {
      canJoin: false,
      title: "Inscripción no disponible",
      message: "Este torneo todavía no tiene un método de pago configurado.",
      buttonLabel: "Inscripción no disponible",
    }
  }

  if (tournament.payment_method === "cash") {
    return {
      canJoin: true,
      title: "Inscripción disponible",
      message:
        "Puedes crear tu solicitud ahora.",
      buttonLabel: "Inscribirse al torneo",
    }
  }

  if (tournament.payment_method === "online") {
    return {
      canJoin: true,
      title: "Inscripción disponible",
      message: "Completa el pago online para confirmar tu inscripción.",
      buttonLabel: "Pagar e inscribirse",
    }
  }

  return {
    canJoin: true,
    title: "Inscripción disponible",
    message: "Elige entre efectivo con validación por email o pago online.",
    buttonLabel: "Inscribirse al torneo",
  }
}

export function validateTournamentForPublication(
  tournament: PublicationTournamentLike,
  categories: PublicationCategoryLike[]
) {
  const issues: string[] = []

  if (!tournament.payment_method) {
    issues.push("Falta configurar el método de pago.")
  }

  if (!tournament.date) {
    issues.push("Falta indicar la fecha del torneo.")
  }

  if (!tournament.registration_deadline) {
    issues.push("Falta indicar la fecha límite de inscripción.")
  }

  if (!tournament.province?.trim()) {
    issues.push("Falta indicar la provincia.")
  }

  if (!tournament.address?.trim()) {
    issues.push("Falta indicar la dirección.")
  }

  if (tournament.date && tournament.registration_deadline) {
    const date = new Date(tournament.date)
    const deadline = new Date(tournament.registration_deadline)

    if (
      !Number.isNaN(date.getTime()) &&
      !Number.isNaN(deadline.getTime()) &&
      deadline > date
    ) {
      issues.push(
        "La fecha límite de inscripción no puede ser posterior a la fecha del torneo."
      )
    }
  }

  if (
    typeof tournament.min_participants !== "number" ||
    tournament.min_participants <= 0 ||
    (tournament.max_participants !== null &&
      tournament.max_participants < tournament.min_participants)
  ) {
    issues.push("Revisa las plazas disponibles del torneo.")
  }

  if (!tournament.has_categories) {
    if (
      !Number.isFinite(Number(tournament.entry_price)) ||
      Number(tournament.entry_price) < 0
    ) {
      issues.push("Revisa el precio del torneo.")
    }
  }

  if (tournament.has_categories) {
    if (categories.length < MIN_TOURNAMENT_CATEGORIES) {
      issues.push(MIN_TOURNAMENT_CATEGORIES_ERROR)
    }

    const invalidCategory = categories.some(
      (category) =>
        !category.name.trim() ||
        !Number.isFinite(Number(category.price)) ||
        Number(category.price) < 0 ||
        category.min_participants <= 0 ||
        (category.max_participants !== null &&
          category.max_participants < category.min_participants)
    )

    if (invalidCategory) {
      issues.push("Revisa las categorías, sus precios y sus plazas.")
    }
  }

  if (tournament.prize_mode === "global" && !tournament.prizes?.trim()) {
    issues.push(
      "Has elegido premios globales, pero no has rellenado el bloque de premios."
    )
  }

  if (
    tournament.prize_mode === "per_category" &&
    (categories.length === 0 ||
      categories.some((category) => !category.prizes?.trim()))
  ) {
    issues.push(
      "Has elegido premios por categoría, pero falta rellenarlos en una o más categorías."
    )
  }

  return {
    canPublish: issues.length === 0,
    issues,
  }
}
