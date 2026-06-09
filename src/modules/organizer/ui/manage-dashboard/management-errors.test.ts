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

  it("explains protected configuration changes", () => {
    expect(
      mapManagementError(
        "Tournament capacity cannot be lower than active registrations",
        "MANAGEMENT_TOURNAMENT_CAPACITY_TOO_LOW"
      )
    ).toBe(
      "Las plazas del torneo no pueden quedar por debajo de sus inscripciones activas."
    )

    expect(
      mapManagementError(
        "Registration pricing and format cannot change after registrations exist",
        "MANAGEMENT_REGISTRATION_CONFIG_LOCKED"
      )
    ).toBe("El precio y el formato quedan bloqueados cuando ya existen inscripciones.")

    expect(
      mapManagementError(
        "Category cannot be deleted after requests, registrations, or a bracket exist",
        "MANAGEMENT_CATEGORY_DELETE_NOT_ALLOWED"
      )
    ).toContain("solicitudes pendientes")
  })
})
