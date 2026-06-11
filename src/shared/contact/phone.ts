const PHONE_FORMAT_PATTERN = /^\+?[\d\s().-]+$/
const SPANISH_PHONE_PATTERN = /^[6789]\d{8}$/
const INTERNATIONAL_PHONE_PATTERN = /^[1-9]\d{7,14}$/

function getFormattedPhoneDigits(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed || !PHONE_FORMAT_PATTERN.test(trimmed)) return null
  return trimmed.replace(/\D/g, "")
}

export function normalizeSpanishPhone(value: string): string | null {
  let digits = getFormattedPhoneDigits(value)
  if (!digits) return null

  if (digits.startsWith("0034")) {
    digits = digits.slice(4)
  } else if (digits.startsWith("34") && digits.length === 11) {
    digits = digits.slice(2)
  }

  return SPANISH_PHONE_PATTERN.test(digits) ? digits : null
}

export function normalizeWhatsappToInternational(
  value: string,
  defaultCountryCode = "34"
): string {
  let digits = getFormattedPhoneDigits(value)
  if (!digits) return ""

  if (digits.startsWith("00")) digits = digits.slice(2)

  if (digits.length === 9) {
    if (defaultCountryCode === "34" && !normalizeSpanishPhone(digits)) return ""
    digits = `${defaultCountryCode}${digits}`
  }

  if (digits.startsWith("34") && digits.length === 11) {
    return normalizeSpanishPhone(digits) ? digits : ""
  }

  return INTERNATIONAL_PHONE_PATTERN.test(digits) ? digits : ""
}
