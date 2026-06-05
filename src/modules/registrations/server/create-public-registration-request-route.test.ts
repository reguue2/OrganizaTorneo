import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPublicRegistrationRequest } from "./create-public-registration-request-route"

const mocks = vi.hoisted(() => ({
  createOnlineRegistrationCheckoutUseCase: vi.fn(),
  createPublicRegistrationRequestUseCase: vi.fn(),
}))

vi.mock("./create-online-registration-checkout-use-case", () => ({
  createOnlineRegistrationCheckoutUseCase:
    mocks.createOnlineRegistrationCheckoutUseCase,
}))

vi.mock("./create-public-registration-request-use-case", () => ({
  createPublicRegistrationRequestUseCase:
    mocks.createPublicRegistrationRequestUseCase,
}))

function createRequest(paymentMethod: "cash" | "online") {
  return new Request("https://example.com/api/public-registration-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tournamentId: "10000000-0000-4000-8000-000000000001",
      categoryId: null,
      displayName: "Participante",
      contactPhone: "666666666",
      contactEmail: "participante@example.com",
      paymentMethod,
    }),
  })
}

describe("create public registration request route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates an email verification request for cash registrations", async () => {
    mocks.createPublicRegistrationRequestUseCase.mockResolvedValue({
      status: 200,
      body: { request_id: "request-id" },
    })

    const response = await createPublicRegistrationRequest(createRequest("cash"))

    expect(response.status).toBe(200)
    expect(mocks.createPublicRegistrationRequestUseCase).toHaveBeenCalledOnce()
    expect(mocks.createOnlineRegistrationCheckoutUseCase).not.toHaveBeenCalled()
  })

  it("creates Stripe Checkout directly for online registrations", async () => {
    mocks.createOnlineRegistrationCheckoutUseCase.mockResolvedValue({
      status: 200,
      body: { checkout_url: "https://checkout.stripe.com/test" },
    })

    const response = await createPublicRegistrationRequest(createRequest("online"))

    expect(response.status).toBe(200)
    expect(mocks.createOnlineRegistrationCheckoutUseCase).toHaveBeenCalledOnce()
    expect(mocks.createPublicRegistrationRequestUseCase).not.toHaveBeenCalled()
  })
})
