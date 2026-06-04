import { describe, expect, it } from "vitest"

import {
  getVerificationNextStepMessage,
  getVerificationStatusLabel,
  mapVerificationErrorMessage,
} from "./display"
import type { VerificationResult } from "./types"

const baseResult: VerificationResult = {
  already_verified: false,
  public_reference: "REG-123",
  registration_status: "pending_cash_validation",
  payment_method: "cash",
  amount: 10,
  cancel_code: "ABC123",
  cancel_token: "token",
  email_delivery_status: null,
  email_delivery_message: null,
}

describe("registration verification display helpers", () => {
  it("maps verification states to labels", () => {
    expect(getVerificationStatusLabel("confirmed")).toBe("Confirmada")
    expect(getVerificationStatusLabel("pending_online_payment")).toBe(
      "Pendiente de pago online"
    )
  })

  it("explains the next step after verification", () => {
    expect(getVerificationNextStepMessage(baseResult)).toContain(
      "validar manualmente"
    )
    expect(
      getVerificationNextStepMessage({
        ...baseResult,
        registration_status: "confirmed",
        amount: 0,
      })
    ).toContain("queda operativa")
  })

  it("maps verification errors to user-facing messages", () => {
    expect(
      mapVerificationErrorMessage("Invalid verification token", "VERIFICATION_INVALID")
    ).toBe(
      "El enlace o el código de verificación no son válidos."
    )
  })
})
