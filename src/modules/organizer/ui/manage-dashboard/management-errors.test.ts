import { describe, expect, it } from "vitest"

import { mapManagementError } from "./management-errors"

describe("management errors", () => {
  it("maps stable error codes to user messages", () => {
    expect(
      mapManagementError(
        "Only online pending registrations can be marked as paid",
        "REGISTRATION_ONLINE_NOT_PENDING"
      )
    ).toBe("Solo puedes confirmar pagos online que sigan pendientes.")
  })

  it("keeps uncatalogued messages as a fallback", () => {
    expect(mapManagementError("Unexpected error", null)).toBe("Unexpected error")
  })
})
