import { describe, expect, it } from "vitest"

import { createRegistrationErrorPayload, getRegistrationErrorCode } from "./errors"

describe("registration server errors", () => {
  it("maps known sql messages to stable codes", () => {
    expect(
      getRegistrationErrorCode(
        "A verification request is already pending for this email or phone"
      )
    ).toBe("REGISTRATION_REQUEST_PENDING")
  })

  it("returns localized messages for known validation errors", () => {
    expect(createRegistrationErrorPayload("Contact phone is invalid")).toEqual({
      code: "VALIDATION_ERROR",
      error: "Introduce un teléfono español válido.",
    })
  })
})
