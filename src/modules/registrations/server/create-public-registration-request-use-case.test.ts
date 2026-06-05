import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPublicRegistrationRequestUseCase } from "./create-public-registration-request-use-case"

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  dispatchRegistrationVerificationEmail: vi.fn(),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}))

vi.mock("./email", () => ({
  dispatchRegistrationVerificationEmail:
    mocks.dispatchRegistrationVerificationEmail,
}))

function queryResult<T>(data: T) {
  const query = {
    eq: vi.fn(() => query),
    gt: vi.fn(() => query),
    is: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
    returns: vi.fn(async () => ({ data, error: null })),
    select: vi.fn(() => query),
  }

  return query
}

describe("create public registration request use case", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns a category full error before creating a request", async () => {
    const rpc = vi.fn()
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "categories") {
          return queryResult({ max_participants: 1 })
        }

        if (table === "registrations") {
          return queryResult([{ status: "confirmed" }])
        }

        return queryResult(null)
      }),
      rpc,
    }

    mocks.createAdminClient.mockReturnValue(supabase)

    const result = await createPublicRegistrationRequestUseCase(
      {
        tournamentId: "10000000-0000-4000-8000-000000000008",
        categoryId: "10000000-0000-4000-8000-000000000009",
        displayName: "Participante",
        contactPhone: "666666666",
        contactEmail: "participante@example.com",
        paymentMethod: "online",
      }
    )

    expect(result).toEqual({
      status: 409,
      body: {
        code: "CATEGORY_FULL",
        error: "Esta categoría ya no tiene plazas disponibles.",
      },
    })
    expect(rpc).not.toHaveBeenCalled()
  })
})
