import { normalizeSpanishPhone } from "@/shared/contact/phone"

export { normalizeSpanishPhone }

export function isValidSpanishPhone(value: string) {
  return normalizeSpanishPhone(value) !== null
}

export function getSpanishPhoneValidationMessage(value: string) {
  if (!value.trim()) {
    return "El teléfono de contacto es obligatorio."
  }

  return isValidSpanishPhone(value)
    ? null
    : "Introduce un teléfono español válido."
}
