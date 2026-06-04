import { describe, expect, it } from "vitest"

import {
  getCancellationStatusLabel,
  mapCancellationErrorMessage,
} from "./display"

describe("registration cancellation display helpers", () => {
  it("maps cancellation states to labels", () => {
    expect(getCancellationStatusLabel("cancelled")).toBe("Cancelada")
    expect(getCancellationStatusLabel(null)).toBe("cancelled")
  })

  it("maps cancellation errors to user-facing messages", () => {
    expect(
      mapCancellationErrorMessage("Registration not found", "REGISTRATION_NOT_FOUND")
    ).toBe(
      "No hemos encontrado la inscripción."
    )
    expect(
      mapCancellationErrorMessage("Invalid cancel code", "CANCELLATION_INVALID")
    ).toBe(
      "El enlace o el código de cancelación no son válidos."
    )
  })
})
