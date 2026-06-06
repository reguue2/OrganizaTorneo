import {
  createApiErrorPayload,
  type ApiErrorPayload,
  type AppErrorCode,
} from "@/shared/api/errors"

const registrationErrorMatchers: Array<{
  code: AppErrorCode
  matches: readonly string[]
  message: string
}> = [
  {
    code: "REGISTRATION_REQUEST_PENDING",
    matches: ["A verification request is already pending for this email or phone"],
    message: "Ya existe una solicitud pendiente de validar con ese email o teléfono.",
  },
  {
    code: "REGISTRATION_DUPLICATED",
    matches: ["A registration already exists with this email or phone"],
    message: "Ya existe una inscripción activa con ese email o teléfono.",
  },
  {
    code: "REGISTRATION_REQUEST_NOT_FOUND",
    matches: ["Verification request not found"],
    message: "No hemos encontrado la solicitud de verificación.",
  },
  {
    code: "REGISTRATION_REQUEST_EXPIRED",
    matches: ["Verification request expired"],
    message:
      "La solicitud de verificación ha caducado. Crea una nueva desde la página del torneo.",
  },
  {
    code: "VERIFICATION_INVALID",
    matches: ["Invalid verification token", "Invalid verification code"],
    message: "El enlace o el código de verificación no son válidos.",
  },
  {
    code: "TOURNAMENT_NOT_OPEN",
    matches: ["Tournament is not open for registration", "Registration deadline passed"],
    message: "Este torneo ya no admite inscripciones.",
  },
  {
    code: "TOURNAMENT_FULL",
    matches: ["Tournament is full"],
    message: "Este torneo ya no tiene plazas disponibles.",
  },
  {
    code: "CATEGORY_FULL",
    matches: ["Category is full"],
    message: "Esta categoría ya no tiene plazas disponibles.",
  },
  {
    code: "PAYMENT_METHOD_NOT_ALLOWED",
    matches: [
      "Only cash registrations are available right now",
      "Only online registrations are available right now",
    ],
    message: "El método de pago elegido no está disponible para este torneo.",
  },
  {
    code: "RATE_LIMITED",
    matches: ["Resend cooldown active", "Resend limit reached"],
    message:
      "Todavía no puedes reenviar el correo. Espera un poco e inténtalo otra vez.",
  },
  {
    code: "REGISTRATION_NOT_FOUND",
    matches: ["Registration not found"],
    message: "No hemos encontrado la inscripción.",
  },
  {
    code: "CANCELLATION_INVALID",
    matches: ["Invalid cancel token", "Invalid cancel code"],
    message: "El enlace o el código de cancelación no son válidos.",
  },
  {
    code: "CANCELLATION_DEADLINE_PASSED",
    matches: ["Public cancellation deadline passed"],
    message: "La fecha límite de cancelación pública ya ha pasado.",
  },
  {
    code: "ACTION_NOT_ALLOWED",
    matches: ["Finished or cancelled tournaments cannot be changed"],
    message:
      "Ya no se puede cancelar públicamente una inscripción de un torneo finalizado o cancelado.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Display name is required"],
    message: "El nombre es obligatorio.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Contact phone is required", "Contact phone is invalid"],
    message: "Introduce un teléfono español válido.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Contact email is required"],
    message: "El email de contacto es obligatorio.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Category is required"],
    message: "Debes seleccionar una categoría.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Category not linked to tournament"],
    message: "La categoría seleccionada no es válida.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Tournament participant type is not configured"],
    message:
      "El organizador todavía no ha configurado el formato de inscripción de este torneo.",
  },
  {
    code: "VALIDATION_ERROR",
    matches: ["Category participant type is not configured"],
    message:
      "Tienes que seleccionar una categoría.",
  },
]

function getRegistrationErrorMatch(message: string) {
  return registrationErrorMatchers.find((item) =>
    item.matches.some((match) => message.includes(match))
  )
}

export function getRegistrationErrorCode(message: string): AppErrorCode {
  return getRegistrationErrorMatch(message)?.code ?? "VALIDATION_ERROR"
}

export function createRegistrationErrorPayload(message: string): ApiErrorPayload {
  const match = getRegistrationErrorMatch(message)
  return createApiErrorPayload(
    match?.message ?? message,
    match?.code ?? "VALIDATION_ERROR"
  )
}
