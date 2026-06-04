import type { EmailDeliveryStatus } from "./types"
import type { AppErrorCode } from "@/shared/api/errors"

const publicRegistrationErrorMessages: Partial<Record<AppErrorCode, string>> = {
  CATEGORY_FULL: "Esta categoría ya no tiene plazas disponibles.",
  PAYMENT_METHOD_NOT_ALLOWED:
    "El método de pago elegido no está disponible para este torneo.",
  RATE_LIMITED:
    "Todavía no puedes reenviar el correo. Espera un poco e inténtalo otra vez.",
  REGISTRATION_DUPLICATED:
    "Ya existe una inscripción activa con ese email o teléfono.",
  REGISTRATION_REQUEST_EXPIRED:
    "La solicitud de verificación ha caducado. Crea una nueva desde la página del torneo.",
  REGISTRATION_REQUEST_PENDING:
    "Ya existe una solicitud pendiente de validar con ese email o teléfono.",
  TOURNAMENT_FULL: "Este torneo ya no tiene plazas disponibles.",
  TOURNAMENT_NOT_OPEN: "Este torneo ya no admite inscripciones.",
  VALIDATION_ERROR: "Los datos de la solicitud no son válidos.",
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function getInitialPaymentMethod(
  paymentMethod: "cash" | "online" | "both" | null
) {
  return paymentMethod === "online" ? "online" : "cash"
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function mapErrorMessage(message: string, code?: AppErrorCode | null) {
  if (!code) return message
  if (code === "VALIDATION_ERROR") return message
  return publicRegistrationErrorMessages[code] ?? message
}

export function getDeliveryTone(status: EmailDeliveryStatus) {
  if (status === "sent") {
    return "border-green-200 bg-green-50 text-green-800"
  }

  if (status === "provider_not_configured") {
    return "border-amber-200 bg-amber-50 text-amber-900"
  }

  return "border-red-200 bg-red-50 text-red-800"
}
