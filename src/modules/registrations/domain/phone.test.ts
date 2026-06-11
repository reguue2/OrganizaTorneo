import { describe, expect, it } from "vitest"

import {
  getSpanishPhoneValidationMessage,
  isValidSpanishPhone,
  normalizeSpanishPhone,
} from "./phone"

describe("phone domain", () => {
  it("normalizes Spanish phone numbers", () => {
    expect(normalizeSpanishPhone("+34 612 345 678")).toBe("612345678")
    expect(normalizeSpanishPhone("0034 912 345 678")).toBe("912345678")
  })

  it("rejects invalid phone numbers", () => {
    expect(normalizeSpanishPhone("123")).toBeNull()
    expect(normalizeSpanishPhone("abc612345678")).toBeNull()
    expect(isValidSpanishPhone("123")).toBe(false)
  })

  it("returns user-facing validation messages", () => {
    expect(getSpanishPhoneValidationMessage("")).toBe(
      "El teléfono de contacto es obligatorio."
    )
    expect(getSpanishPhoneValidationMessage("123")).toBe(
      "Introduce un teléfono español válido."
    )
    expect(getSpanishPhoneValidationMessage("612345678")).toBeNull()
  })
})
