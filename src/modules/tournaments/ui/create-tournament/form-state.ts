import {
  MIN_TOURNAMENT_CATEGORIES,
  MIN_TOURNAMENT_CATEGORIES_ERROR,
} from "@/modules/tournaments/domain/constants"
import { hasRequiredContact } from "@/modules/profile/domain"

import type {
  CreateTournamentCategoryDraft,
  CreateTournamentDraft,
  CreateTournamentErrors,
  CreateTournamentStepId,
} from "./types"

export const CREATE_TOURNAMENT_STEPS: Array<{
  id: CreateTournamentStepId
  label: string
}> = [
  { id: "basics", label: "Información básica" },
  { id: "structure", label: "Categorías" },
  { id: "pricing", label: "Inscripción" },
  { id: "details", label: "Publicación" },
  { id: "review", label: "Confirmar" },
]

export const EMPTY_CATEGORY: CreateTournamentCategoryDraft = {
  id: "",
  name: "",
  participant_type: null,
  price: "0",
  max_participants: "",
  noMax: true,
  hasCustomDate: false,
  hasCustomAddress: false,
  start_at: "",
  address: "",
  prizes: "",
}

export const INITIAL_CREATE_TOURNAMENT_DRAFT: CreateTournamentDraft = {
  title: "",
  description: "",
  province: "",
  address: "",
  date: "",
  registration_deadline: "",
  is_public: true,
  has_categories: false,
  participant_type: null,
  max_participants: "",
  noMax: true,
  entry_price: "0",
  payment_method: "cash",
  prize_mode: "none",
  prizes: "",
  rules: "",
  categories: [],
  show_contact: true,
  contact_name: "",
  contact_whatsapp: "",
  contact_email: "",
}

export function createCategoryId() {
  return `cat_${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptyCategoryDraft(): CreateTournamentCategoryDraft {
  return {
    ...EMPTY_CATEGORY,
    id: createCategoryId(),
  }
}

export function parseStoredCreateTournamentDraft(
  raw: string | null
): CreateTournamentDraft | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<CreateTournamentDraft>

    return {
      ...INITIAL_CREATE_TOURNAMENT_DRAFT,
      ...parsed,
      categories: Array.isArray(parsed.categories)
        ? parsed.categories.map((category) => ({
            ...EMPTY_CATEGORY,
            ...category,
            hasCustomDate: Boolean(category.hasCustomDate || category.start_at),
            hasCustomAddress: Boolean(category.hasCustomAddress || category.address),
            id: category.id || createCategoryId(),
          }))
        : [],
    }
  } catch {
    return null
  }
}

export function serializeCreateTournamentDraft(draft: CreateTournamentDraft) {
  return JSON.stringify(draft)
}

export function serializeCreateTournamentCategories(
  draft: CreateTournamentDraft
) {
  if (!draft.has_categories) return "[]"

  return JSON.stringify(
    draft.categories.map((category) => ({
      name: category.name.trim(),
      participant_type: category.participant_type,
      price: category.price.trim() || "0",
      min_participants: "1",
      max_participants: category.noMax
        ? null
        : category.max_participants.trim() || null,
      start_at: category.hasCustomDate ? category.start_at || null : null,
      address: category.hasCustomAddress ? category.address.trim() || null : null,
      prizes: category.prizes.trim() || null,
    }))
  )
}

export function validateCategoryDraft(
  category: CreateTournamentCategoryDraft
): CreateTournamentErrors {
  const errors: CreateTournamentErrors = {}
  const price = Number(category.price || "0")
  const maxParticipants = Number(category.max_participants || "0")

  if (!category.name.trim()) errors.name = "El nombre es obligatorio."
  if (!category.participant_type) {
    errors.participant_type = "El formato de inscripción es obligatorio."
  }
  if (!Number.isFinite(price) || price < 0) {
    errors.price = "El precio no es válido."
  }
  if (
    !category.noMax &&
    (!Number.isInteger(maxParticipants) || maxParticipants < 1)
  ) {
    errors.max_participants = "Las plazas deben ser al menos 1."
  }

  return errors
}

export function validateStep(
  step: CreateTournamentStepId,
  draft: CreateTournamentDraft
) {
  const errors: CreateTournamentErrors = {}

  if (step === "basics") {
    if (!draft.title.trim()) errors.title = "El título es obligatorio."
    if (!draft.province.trim()) errors.province = "La provincia es obligatoria."
    if (!draft.address.trim()) errors.address = "La dirección es obligatoria."
    if (!draft.date) errors.date = "La fecha del torneo es obligatoria."
    if (!draft.registration_deadline) {
      errors.registration_deadline = "La fecha límite es obligatoria."
    }
    if (draft.date && draft.registration_deadline) {
      const date = new Date(draft.date)
      const deadline = new Date(draft.registration_deadline)

      if (!Number.isNaN(date.getTime()) && !Number.isNaN(deadline.getTime())) {
        if (deadline > date) {
          errors.registration_deadline =
            "La fecha límite no puede ser posterior al torneo."
        }
      }
    }
  }

  if (step === "structure") {
    if (
      draft.has_categories &&
      draft.categories.length < MIN_TOURNAMENT_CATEGORIES
    ) {
      errors.categories = MIN_TOURNAMENT_CATEGORIES_ERROR
    }
    if (!draft.has_categories && !draft.participant_type) {
      errors.participant_type = "Elige inscripción individual o por equipos."
    }
  }

  if (step === "pricing") {
    if (draft.has_categories) return errors

    const maxParticipants = Number(draft.max_participants || "0")
    const entryPrice = Number(draft.entry_price || "0")

    if (
      !draft.noMax &&
      (!Number.isInteger(maxParticipants) || maxParticipants < 1)
    ) {
      errors.max_participants = "Las plazas deben ser al menos 1."
    }
    if (!Number.isFinite(entryPrice) || entryPrice < 0) {
      errors.entry_price = "El precio no es válido."
    }
  }

  if (step === "details") {
    if (draft.prize_mode === "global" && !draft.prizes.trim()) {
      errors.prizes = "Has elegido premios globales, pero no los has rellenado."
    }
    if (
      draft.prize_mode === "per_category" &&
      draft.categories.some((category) => !category.prizes.trim())
    ) {
      errors.categories = "Rellena los premios de cada categoría."
    }
  }

  if (step === "review" && draft.show_contact) {
    const contact = {
      name: draft.contact_name,
      whatsapp: draft.contact_whatsapp,
      contactEmail: draft.contact_email,
    }
    if (!draft.contact_name.trim()) {
      errors.contact_name = "Indica tu nombre o el de tu club."
    } else if (!hasRequiredContact(contact)) {
      errors.contact = "Añade al menos WhatsApp o email para que puedan escribirte."
    }
  }

  return errors
}

export function formatPreviewMoney(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(amount)) return "-"
  if (amount === 0) return "Gratis"

  const text = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.00$/, "")

  return `${text}€`
}

export function formatPreviewDate(value: string) {
  if (!value) return "Por definir"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Por definir"

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
