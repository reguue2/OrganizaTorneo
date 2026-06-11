export const MAX_POSTGRES_INTEGER = 2_147_483_647

type IntegerInputOptions = {
  min?: number
  max?: number
}

function normalizeGroupedInteger(value: string): string | null {
  if (/^\d+$/.test(value)) return value
  if (!/^\d{1,3}(?:[.\s]\d{3})+$/.test(value)) return null
  return value.replace(/[.\s]/g, "")
}

export function parseIntegerInput(
  value: string,
  { min = 0, max = MAX_POSTGRES_INTEGER }: IntegerInputOptions = {}
): number | null {
  const trimmed = value.trim().replace(/^\+/, "")
  const normalized = normalizeGroupedInteger(trimmed)
  if (!normalized) return null

  const parsed = Number(normalized)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return null
  return parsed
}

function parseSingleSeparatorMoney(value: string, separator: "." | ","): string | null {
  const parts = value.split(separator)

  if (parts.length === 2) {
    const [integerPart, decimalPart] = parts
    if (decimalPart.length <= 2) {
      if (integerPart && !/^\d+$/.test(integerPart)) return null
      if (!/^\d*$/.test(decimalPart)) return null
      return `${integerPart || "0"}.${decimalPart || "0"}`
    }
  }

  const groupedInteger = normalizeGroupedInteger(value)
  return groupedInteger
}

export function parseMoneyInput(value: string): number | null {
  const compact = value.trim().replace(/\s/g, "").replace(/€/g, "").replace(/^\+/, "")
  if (!compact || !/\d/.test(compact) || !/^[\d.,]+$/.test(compact)) return null

  const lastDot = compact.lastIndexOf(".")
  const lastComma = compact.lastIndexOf(",")
  let normalized: string | null

  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSeparator = lastDot > lastComma ? "." : ","
    const groupingSeparator = decimalSeparator === "." ? "," : "."
    const decimalIndex = compact.lastIndexOf(decimalSeparator)
    const integerPart = compact.slice(0, decimalIndex)
    const decimalPart = compact.slice(decimalIndex + 1)
    const normalizedInteger = normalizeGroupedInteger(
      integerPart.replaceAll(groupingSeparator, ".")
    )

    normalized =
      normalizedInteger !== null && /^\d{1,2}$/.test(decimalPart)
        ? `${normalizedInteger}.${decimalPart}`
        : null
  } else if (lastDot !== -1) {
    normalized = parseSingleSeparatorMoney(compact, ".")
  } else if (lastComma !== -1) {
    normalized = parseSingleSeparatorMoney(compact, ",")
  } else {
    normalized = /^\d+$/.test(compact) ? compact : null
  }

  if (normalized === null) return null
  const parsed = Number(normalized)
  return isValidMoneyAmount(parsed) ? parsed : null
}

export function isValidMoneyAmount(value: number): boolean {
  if (!Number.isFinite(value) || value < 0) return false
  const cents = value * 100
  return (
    Number.isSafeInteger(Math.round(cents)) &&
    Math.abs(cents - Math.round(cents)) < 1e-8
  )
}

export function normalizeSixDigitCodeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6)
}
