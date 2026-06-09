import type { ManagementErrorCode } from "@/modules/organizer/domain"

const managementErrorMessages: Record<ManagementErrorCode, string> = {
  MANAGEMENT_ACTION_NOT_ALLOWED: "No se pudo completar la acción.",
  MANAGEMENT_AUTH_REQUIRED: "Debes iniciar sesión para gestionar este torneo.",
  MANAGEMENT_FORBIDDEN: "No puedes gestionar este torneo.",
  MANAGEMENT_REGISTRATION_FORBIDDEN: "No puedes gestionar esta inscripción.",
  MANAGEMENT_REGISTRATION_INVALID: "La inscripción no es válida.",
  MANAGEMENT_TOURNAMENT_INVALID: "El torneo no es válido.",
  MANAGEMENT_VALIDATION_ERROR: "Los datos enviados no son válidos.",
  MANAGEMENT_REGISTRATION_DUPLICATE:
    "Ya existe una inscripción activa con ese teléfono o email.",
  MANAGEMENT_REGISTRATION_WINDOW_CLOSED:
    "Solo puedes añadir inscripciones mientras el torneo esté publicado o cerrado.",
  MANAGEMENT_CATEGORY_FULL: "La categoría ya está completa.",
  MANAGEMENT_TOURNAMENT_FULL: "El torneo ya está completo.",
  MANAGEMENT_CATEGORY_ADD_NOT_ALLOWED:
    "No puedes añadir categorías después de generar un cuadro.",
  MANAGEMENT_CATEGORY_DELETE_NOT_ALLOWED:
    "No puedes eliminar una categoría que tenga solicitudes pendientes, inscripciones o un cuadro.",
  MANAGEMENT_CATEGORY_CAPACITY_TOO_LOW:
    "Las plazas de una categoría no pueden quedar por debajo de sus inscripciones activas.",
  MANAGEMENT_REGISTRATION_CONFIG_LOCKED:
    "El precio, método de pago y formato quedan bloqueados cuando ya existen inscripciones.",
  MANAGEMENT_TOURNAMENT_CAPACITY_TOO_LOW:
    "Las plazas del torneo no pueden quedar por debajo de sus inscripciones activas.",
  TOURNAMENT_CANCEL_NOT_ALLOWED: "Solo puedes cancelar torneos publicados o cerrados.",
  TOURNAMENT_CONFIG_NOT_ALLOWED:
    "Solo puedes editar la configuración de torneos publicados o cerrados.",
  TOURNAMENT_FINISH_NOT_ALLOWED:
    "Solo puedes finalizar torneos publicados o cerrados.",
  TOURNAMENT_REOPEN_DEADLINE_PASSED:
    "No puedes reabrir inscripciones porque la fecha límite ya ha pasado.",
  TOURNAMENT_REOPEN_NOT_ALLOWED: "Solo puedes reabrir torneos cerrados.",
  TOURNAMENT_STATUS_CASH_APPROVAL_NOT_ALLOWED:
    "Solo puedes validar cobros en efectivo mientras el torneo esté publicado o cerrado y todavía no haya empezado.",
  TOURNAMENT_STATUS_ONLINE_CONFIRMATION_NOT_ALLOWED:
    "Solo puedes confirmar pagos online mientras el torneo esté publicado o cerrado y todavía no haya empezado.",
  TOURNAMENT_STARTED:
    "Esta acción ya no está permitida porque el torneo ya ha comenzado.",
  TOURNAMENT_TO_CLOSE_NOT_ALLOWED: "Solo puedes cerrar torneos publicados.",
  REGISTRATION_CASH_APPROVAL_NOT_ALLOWED:
    "Solo puedes validar manualmente una inscripción en efectivo.",
  REGISTRATION_CASH_NOT_PENDING:
    "Solo puedes validar inscripciones en efectivo que sigan pendientes de validación.",
  REGISTRATION_CANCEL_NOT_ALLOWED:
    "Solo puedes cancelar inscripciones antes de que empiece el torneo.",
  REGISTRATION_EXPIRED: "No puedes cancelar inscripciones caducadas.",
  REGISTRATION_ONLINE_CONFIRMATION_NOT_ALLOWED:
    "Solo puedes confirmar manualmente pagos online simulados.",
  REGISTRATION_ONLINE_NOT_PENDING:
    "Solo puedes confirmar pagos online que sigan pendientes.",
}

export function mapManagementError(
  message: string,
  code?: ManagementErrorCode | null
) {
  return code ? managementErrorMessages[code] : message
}
