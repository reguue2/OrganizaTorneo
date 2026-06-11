// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import type { RegistrationRow } from "@/modules/organizer/domain"
import type { TournamentBracketRow } from "@/modules/tournaments/domain"

import { ManagementConfigCategories } from "./management-config-categories"
import type { ConfigForm } from "./types"

const form: ConfigForm = {
  title: "Torneo",
  description: "",
  rules: "",
  province: "Madrid",
  address: "Polideportivo",
  date: "2026-07-01T10:00",
  registration_deadline: "2026-06-30T10:00",
  is_public: true,
  show_organizer_contact: true,
  payment_method: "cash",
  participant_type: null,
  entry_price: "0",
  max_participants: "",
  no_max_participants: true,
  prize_mode: "none",
  prizes: "",
  categories: [
    {
      key: "category-a",
      id: "category-a",
      name: "Senior",
      participant_type: "individual",
      price: "10",
      max_participants: "16",
      no_max_participants: false,
      start_at: "",
      address: "",
      prizes: "",
    },
  ],
}

describe("ManagementConfigCategories", () => {
  it("allows adding a category when registrations and brackets already exist", () => {
    const setForm = vi.fn()

    const document = new DOMParser().parseFromString(
      renderToStaticMarkup(
        <ManagementConfigCategories
          brackets={[{ category_id: "category-a" } as TournamentBracketRow]}
          canEdit
          form={form}
          registrations={[{ category_id: "category-a" } as RegistrationRow]}
          setForm={setForm}
        />
      ),
      "text/html"
    )

    const addButton = [...document.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Añadir categoría")
    )
    expect(addButton?.disabled).toBe(false)
  })
})
