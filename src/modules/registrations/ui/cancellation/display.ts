import type { AppErrorCode } from "@/shared/api/errors"

const cancellationErrorMessages: Partial<Record<AppErrorCode, string>> = {
  ACTION_NOT_ALLOWED:
    "Ya no se puede cancelar públicamente una inscripción de un torneo finalizado o cancelado.",
  CANCELLATION_DEADLINE_PASSED:
    "La fecha límite de cancelación pública ya ha pasado.",
  CANCELLATION_INVALID:
    "El enlace o el código de cancelación no son válidos.",
  REGISTRATION_NOT_FOUND: "No hemos encontrado la inscripción.",
}

export function mapCancellationErrorMessage(
  message: string,
  code?: AppErrorCode | null
) {
  return code ? cancellationErrorMessages[code] ?? message : message
}

export function getCancellationStatusLabel(status: string | null | undefined) {
  if (status === "cancelled") return "Cancelada"
  return status ?? "cancelled"
}
