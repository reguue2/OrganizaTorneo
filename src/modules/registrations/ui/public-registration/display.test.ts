import { describe, expect, it } from "vitest"

import {
  getInitialPaymentMethod,
  isValidEmail,
  mapErrorMessage,
} from "./display"

describe("public registration display helpers", () => {
  it("validates email format for the public form", () => {
    expect(isValidEmail("jugador@example.com")).toBe(true)
    expect(isValidEmail("jugador")).toBe(false)
  })

  it("selects the initial payment method from tournament configuration", () => {
    expect(getInitialPaymentMethod("online")).toBe("online")
    expect(getInitialPaymentMethod("cash")).toBe("cash")
    expect(getInitialPaymentMethod("both")).toBe("cash")
    expect(getInitialPaymentMethod(null)).toBe("cash")
  })

  it("maps backend registration errors to user-facing messages", () => {
    expect(
      mapErrorMessage(
        "A verification request is already pending for this email or phone",
        "REGISTRATION_REQUEST_PENDING"
      )
    ).toBe("Ya existe una solicitud pendiente de validar con ese email o teléfono.")
    expect(mapErrorMessage("Unknown backend error")).toBe("Unknown backend error")
  })
})
