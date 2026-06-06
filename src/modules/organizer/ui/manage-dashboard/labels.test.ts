import { describe, expect, it } from "vitest"

import type { RegistrationView } from "./types"
import {
  getPaymentMethodLabel,
  getRegistrationStatusLabel,
  getStatusLabel,
} from "./labels"

function registrationView(
  status: RegistrationView["registration"]["status"],
  paymentMethod: RegistrationView["registration"]["payment_method"]
): RegistrationView {
  return {
    registration: {
      id: "registration-id",
      tournament_id: "tournament-id",
      category_id: null,
      participant_id: "participant-id",
      status,
      payment_method: paymentMethod,
      public_reference: null,
      created_at: null,
      cancelled_at: null,
    },
    participant: null,
    category: null,
    payment: null,
    amount: 0,
  }
}

describe("management dashboard labels", () => {
  it("maps tournament operational state labels", () => {
    expect(
      getStatusLabel({
        date: "2999-01-01T10:00:00.000Z",
        registration_deadline: "2998-12-20T10:00:00.000Z",
        status: "published",
      })
    ).toBe("Inscripciones abiertas")
    expect(
      getStatusLabel({
        date: "2999-01-01T10:00:00.000Z",
        registration_deadline: "2998-12-20T10:00:00.000Z",
        status: "closed",
      })
    ).toBe("Inscripciones cerradas")
    expect(
      getStatusLabel({
        date: null,
        registration_deadline: null,
        status: null,
      })
    ).toBe("No publicado")
    expect(
      getStatusLabel({
        date: "2020-01-01T10:00:00.000Z",
        registration_deadline: "2019-12-20T10:00:00.000Z",
        status: "published",
      })
    ).toBe("Finalizado")
  })

  it("maps registration labels using status and payment method", () => {
    expect(getRegistrationStatusLabel(registrationView("confirmed", "cash"))).toBe(
      "Confirmada"
    )
    expect(
      getRegistrationStatusLabel(registrationView("pending_cash_validation", "cash"))
    ).toBe(
      "Pendiente de validación en efectivo"
    )
    expect(
      getRegistrationStatusLabel(registrationView("pending_online_payment", "online"))
    ).toBe(
      "Pendiente de pago online"
    )
  })

  it("maps payment method labels", () => {
    expect(getPaymentMethodLabel("cash")).toBe("Efectivo")
    expect(getPaymentMethodLabel("online")).toBe("Online")
    expect(getPaymentMethodLabel(null)).toBe("Por definir")
  })
})
