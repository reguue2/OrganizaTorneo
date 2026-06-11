import { z } from "zod"
import {
  MIN_TOURNAMENT_CATEGORIES,
  MIN_TOURNAMENT_CATEGORIES_ERROR,
} from "@/modules/tournaments/domain/constants"

export const CreateTournamentCategorySchema = z
  .object({
    name: z.string().trim().min(1, "El nombre de la categoría es obligatorio."),
    participant_type: z.enum(["individual", "team"]),
    price: z.coerce
      .number()
      .min(0, "El precio de la categoría no puede ser negativo."),
    min_participants: z.coerce
      .number()
      .int()
      .min(1, "Las plazas de la categoría no son válidas."),
    max_participants: z.union([z.coerce.number().int().min(1), z.null()]),
    start_at: z.string().nullable(),
    address: z.string().nullable(),
    prizes: z.string().nullable(),
  })
  .superRefine((value, ctx) => {
    if (
      value.max_participants !== null &&
      value.max_participants < value.min_participants
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Las plazas de la categoría no son válidas.",
        path: ["max_participants"],
      })
    }
  })

export type CreateTournamentCategoryInput = z.infer<
  typeof CreateTournamentCategorySchema
>

const PaymentMethodSchema = z.enum(["cash", "online", "both"])
const PrizeModeSchema = z.enum(["none", "global", "per_category"])

export const CreateTournamentFormSchema = z
  .object({
    title: z.string().trim().min(1, "El título es obligatorio."),
    description: z.string().trim(),
    province: z.string().trim().min(1, "La provincia es obligatoria."),
    address: z.string().trim().min(1, "La dirección es obligatoria."),
    date: z.string().trim().min(1, "La fecha del torneo es obligatoria."),
    registration_deadline: z
      .string()
      .trim()
      .min(1, "La fecha límite de inscripción es obligatoria."),
    is_public: z.boolean(),
    has_categories: z.boolean(),
    participant_type: z.enum(["individual", "team"]).nullable(),
    min_participants: z
      .number()
      .int("Las plazas del torneo no son válidas.")
      .min(1, "Las plazas del torneo no son válidas."),
    max_participants: z.number().int().nullable(),
    payment_method: PaymentMethodSchema.nullable(),
    prize_mode: PrizeModeSchema,
    prizes: z.string().trim(),
    rules: z.string().trim(),
    entry_price: z.number(),
    categories: z.array(CreateTournamentCategorySchema),
    show_contact: z.boolean(),
    contact_name: z.string().trim(),
    contact_whatsapp: z.string().trim(),
    contact_email: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.show_contact) {
      if (!value.contact_name) {
        ctx.addIssue({
          code: "custom",
          message: "Indica tu nombre o el de tu club para que puedan contactarte.",
          path: ["contact_name"],
        })
      } else if (!value.contact_whatsapp && !value.contact_email) {
        ctx.addIssue({
          code: "custom",
          message:
            "Añade al menos WhatsApp o email para que los participantes puedan escribirte.",
          path: ["contact"],
        })
      }
    }

    const date = new Date(value.date)
    const deadline = new Date(value.registration_deadline)

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha del torneo no es válida.",
        path: ["date"],
      })
    }

    if (Number.isNaN(deadline.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha límite de inscripción no es válida.",
        path: ["registration_deadline"],
      })
    }

    if (
      !Number.isNaN(date.getTime()) &&
      !Number.isNaN(deadline.getTime()) &&
      deadline > date
    ) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha límite no puede ser posterior al torneo.",
        path: ["registration_deadline"],
      })
    }

    if (!value.payment_method) {
      ctx.addIssue({
        code: "custom",
        message: "Debes elegir un método de pago.",
        path: ["payment_method"],
      })
    }

    if (
      value.max_participants !== null &&
      value.max_participants < value.min_participants
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Las plazas del torneo no son válidas.",
        path: ["max_participants"],
      })
    }

    if (value.has_categories) {
      if (value.categories.length < MIN_TOURNAMENT_CATEGORIES) {
        ctx.addIssue({
          code: "custom",
          message: MIN_TOURNAMENT_CATEGORIES_ERROR,
          path: ["categories"],
        })
      }

      if (value.prize_mode === "per_category") {
        const emptyPrizeCategory = value.categories.find(
          (category) => !category.prizes?.trim()
        )

        if (emptyPrizeCategory) {
          ctx.addIssue({
            code: "custom",
            message: `Faltan los premios en la categoría “${emptyPrizeCategory.name}”.`,
            path: ["categories"],
          })
        }
      }
    } else {
      if (!value.participant_type) {
        ctx.addIssue({
          code: "custom",
          message:
            "Debes indicar si el torneo se inscribe de forma individual o por equipos.",
          path: ["participant_type"],
        })
      }

      if (!Number.isFinite(value.entry_price) || value.entry_price < 0) {
        ctx.addIssue({
          code: "custom",
          message: "El precio del torneo no es válido.",
          path: ["entry_price"],
        })
      }

      if (value.prize_mode === "per_category") {
        ctx.addIssue({
          code: "custom",
          message:
            "Los premios por categoría solo son válidos si el torneo tiene categorías.",
          path: ["prize_mode"],
        })
      }
    }

    if (value.prize_mode === "global" && !value.prizes.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Has elegido premios globales, pero no los has rellenado.",
        path: ["prizes"],
      })
    }
  })

export type CreateTournamentFormInput = z.infer<typeof CreateTournamentFormSchema>

export function parseBooleanFormValue(value: FormDataEntryValue | null) {
  return value === "true"
}

export function parseParticipantTypeFormValue(value: FormDataEntryValue | null) {
  if (value === "individual" || value === "team") return value
  return null
}

export function parseNullableIntegerFormValue(
  value: FormDataEntryValue | null
): number | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text) return null

  const parsed = Number(text)
  if (!Number.isInteger(parsed)) return Number.NaN

  return parsed
}

export function parseCreateTournamentCategories(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    return z.array(CreateTournamentCategorySchema).parse(parsed)
  } catch {
    throw new Error("Las categorías no tienen un formato válido.")
  }
}

function parsePaymentMethodFormValue(value: FormDataEntryValue | null) {
  if (value === "cash" || value === "online" || value === "both") return value
  return null
}

function parsePrizeModeFormValue(value: FormDataEntryValue | null) {
  if (value === "none" || value === "global" || value === "per_category") {
    return value
  }

  return "none"
}

function getFirstSchemaError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Los datos del torneo no son válidos."
}

export function parseCreateTournamentFormData(formData: FormData):
  | { success: true; data: CreateTournamentFormInput }
  | { success: false; error: string } {
  const hasCategories = parseBooleanFormValue(formData.get("has_categories"))
  const categoriesRaw =
    (formData.get("categories_json") as string | null)?.trim() ?? "[]"
  let categories: CreateTournamentCategoryInput[] = []

  if (hasCategories) {
    try {
      categories = parseCreateTournamentCategories(categoriesRaw)
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Las categorías no tienen un formato válido.",
      }
    }
  }

  const minParticipants = parseNullableIntegerFormValue(
    formData.get("min_participants")
  )
  const maxParticipants = parseNullableIntegerFormValue(
    formData.get("max_participants")
  )
  const entryPriceRaw = (formData.get("entry_price") as string | null)?.trim() ?? ""
  const entryPrice = hasCategories ? 0 : Number(entryPriceRaw || "0")

  if (minParticipants === null || Number.isNaN(minParticipants)) {
    return {
      success: false,
      error: "Las plazas del torneo no son válidas.",
    }
  }

  if (Number.isNaN(maxParticipants)) {
    return {
      success: false,
      error: "Las plazas del torneo no son válidas.",
    }
  }

  const parsed = CreateTournamentFormSchema.safeParse({
    title: (formData.get("title") as string | null) ?? "",
    description: (formData.get("description") as string | null) ?? "",
    province: (formData.get("province") as string | null) ?? "",
    address: (formData.get("address") as string | null) ?? "",
    date: (formData.get("date") as string | null) ?? "",
    registration_deadline:
      (formData.get("registration_deadline") as string | null) ?? "",
    is_public: parseBooleanFormValue(formData.get("is_public")),
    has_categories: hasCategories,
    participant_type: parseParticipantTypeFormValue(
      formData.get("participant_type")
    ),
    min_participants: minParticipants,
    max_participants: maxParticipants,
    payment_method: parsePaymentMethodFormValue(formData.get("payment_method")),
    prize_mode: parsePrizeModeFormValue(formData.get("prize_mode")),
    prizes: (formData.get("prizes") as string | null) ?? "",
    rules: (formData.get("rules") as string | null) ?? "",
    entry_price: entryPrice,
    categories,
    show_contact: parseBooleanFormValue(formData.get("show_contact")),
    contact_name: (formData.get("contact_name") as string | null) ?? "",
    contact_whatsapp: (formData.get("contact_whatsapp") as string | null) ?? "",
    contact_email: (formData.get("contact_email") as string | null) ?? "",
  })

  if (!parsed.success) {
    return {
      success: false,
      error: getFirstSchemaError(parsed.error),
    }
  }

  return { success: true, data: parsed.data }
}
