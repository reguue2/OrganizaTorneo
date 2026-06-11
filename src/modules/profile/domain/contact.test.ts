import { describe, expect, it } from "vitest"

import {
  buildWhatsappLink,
  hasRequiredContact,
  normalizeWhatsappToInternational,
} from "./contact"

describe("normalizeWhatsappToInternational", () => {
  it("prefixes a bare 9-digit Spanish number with the country code", () => {
    expect(normalizeWhatsappToInternational("600 123 456")).toBe("34600123456")
  })

  it("keeps a number that already has a country code", () => {
    expect(normalizeWhatsappToInternational("+34 611 240 873")).toBe("34611240873")
  })

  it("returns an empty string when there are no digits", () => {
    expect(normalizeWhatsappToInternational("")).toBe("")
  })
})

describe("buildWhatsappLink", () => {
  it("builds a wa.me link with the international number and message", () => {
    const link = buildWhatsappLink("34600123456", "Hola")
    expect(link).toBe("https://wa.me/34600123456?text=Hola")
  })

  it("returns null without digits", () => {
    expect(buildWhatsappLink("")).toBeNull()
  })
})

describe("hasRequiredContact", () => {
  it("needs a name plus WhatsApp or email", () => {
    expect(
      hasRequiredContact({ name: "Club", whatsapp: "34600123456", contactEmail: "" })
    ).toBe(true)
    expect(
      hasRequiredContact({ name: "Club", whatsapp: "", contactEmail: "a@b.com" })
    ).toBe(true)
    expect(hasRequiredContact({ name: "Club", whatsapp: "", contactEmail: "" })).toBe(false)
    expect(
      hasRequiredContact({ name: "", whatsapp: "34600123456", contactEmail: "" })
    ).toBe(false)
  })
})
