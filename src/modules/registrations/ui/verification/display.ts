import type { EmailDeliveryStatus, VerificationResult } from "./types"
import type { AppErrorCode } from "@/shared/api/errors"

export type VerificationDeliveryVariant = "success" | "warning" | "destructive" | "default"

const verificationErrorMessages: Partial<Record<AppErrorCode, string>> = {
  REGISTRATION_DUPLICATED:
    "Ya existe una inscripción activa con ese email o teléfono.",
  REGISTRATION_REQUEST_EXPIRED:
    "La solicitud de verificación ha caducado. Tendrás que crear una nueva desde la página del torneo.",
  REGISTRATION_REQUEST_NOT_FOUND:
    "No hemos encontrado la solicitud de verificación.",
  TOURNAMENT_NOT_OPEN: "El torneo ya no admite inscripciones.",
  VERIFICATION_INVALID: "El enlace o el código de verificación no son válidos.",
}

export function mapVerificationErrorMessage(
  message: string,
  code?: AppErrorCode | null
) {
  return code ? verificationErrorMessages[code] ?? message : message
}

export function getVerificationStatusLabel(status: string | null | undefined) {
  if (status === "confirmed") return "Confirmada"
  if (status === "pending_cash_validation") {
    return "Pendiente de validación"
  }
  if (status === "pending_online_payment") return "Pendiente de pago online"
  if (status === "cancelled") return "Cancelada"
  return status ?? "—"
}

export function getVerificationNextStepMessage(result: VerificationResult) {
  if ((result.amount ?? 0) <= 0 || result.registration_status === "confirmed") {
    return "La inscripción ya queda operativa. Guarda la referencia pública y los datos de cancelación."
  }

  if (result.registration_status === "pending_cash_validation") {
    return "La inscripción ya existe, pero el organizador tendrá que validar manualmente el pago en efectivo."
  }

  if (result.registration_status === "pending_online_payment") {
    return "La inscripción ya existe. Mientras el pago online siga simulado, el organizador podrá confirmarlo desde su panel."
  }

  return "La solicitud ya está validada y la inscripción real se ha creado correctamente."
}

export function getVerificationDeliveryVariant(
  status: EmailDeliveryStatus
): VerificationDeliveryVariant {
  if (status === "sent") return "success"
  if (status === "provider_not_configured") return "warning"
  if (status === "provider_error") return "destructive"
  return "default"
}

export function getVerificationDeliveryTitle(status: EmailDeliveryStatus) {
  if (status === "sent") return "Correo de confirmación enviado"
  if (status === "provider_not_configured") {
    return "Inscripción creada, pero falta terminar el proveedor de correo"
  }
  if (status === "provider_error") {
    return "La inscripción se ha creado, pero el correo de confirmación ha fallado"
  }
  return "Estado del correo"
}
