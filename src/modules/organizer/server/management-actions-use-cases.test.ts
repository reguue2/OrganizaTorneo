import { describe, expect, it, vi } from "vitest"

import {
  approveManagedCashRegistrationUseCase,
  updateManagedTournamentStatusUseCase,
} from "./management-actions-use-cases"

function supabaseWithRpc(error: { message: string } | null = null) {
  return {
    rpc: vi.fn().mockResolvedValue({ error }),
  } as never
}

describe("management action use cases", () => {
  it("returns ok when tournament status rpc succeeds", async () => {
    const supabase = supabaseWithRpc()

    await expect(
      updateManagedTournamentStatusUseCase({
        nextStatus: "closed",
        supabase,
        tournamentId: "tournament-id",
      })
    ).resolves.toEqual({
      status: 200,
      body: { ok: true },
    })
  })

  it("maps rpc errors to management payloads", async () => {
    const result = await approveManagedCashRegistrationUseCase({
      registrationId: "registration-id",
      supabase: supabaseWithRpc({
        message: "Only cash registrations can be approved manually",
      }),
    })

    expect(result).toEqual({
      status: 400,
      body: {
        code: "REGISTRATION_CASH_APPROVAL_NOT_ALLOWED",
        error: "Only cash registrations can be approved manually",
      },
    })
  })
})
