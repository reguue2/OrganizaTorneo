export type OrganizerProfile = {
  name: string
  email: string
  contactEmail: string
  whatsapp: string
}

export type OrganizerPublicContact = {
  name: string | null
  contactEmail: string | null
  whatsapp: string | null
}

/** The contact required for participants to reach the organizer. */
export function hasRequiredContact(contact: {
  name: string
  whatsapp: string
  contactEmail: string
}): boolean {
  return Boolean(contact.name.trim() && (contact.whatsapp.trim() || contact.contactEmail.trim()))
}

export function hasAnyPublicContact(contact: OrganizerPublicContact): boolean {
  return Boolean(contact.whatsapp || contact.contactEmail)
}

/** Strips everything but digits so the number works in a wa.me URL. */
export function normalizeWhatsappDigits(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Turns a raw WhatsApp input into an international number (digits only, with
 * country code) so `wa.me` links work. A bare 9-digit Spanish number gets the
 * `34` prefix; anything already carrying a country code is kept as-is. Returns
 * "" when there are no digits.
 */
export function normalizeWhatsappToInternational(
  value: string,
  defaultCountryCode = "34"
): string {
  const digits = normalizeWhatsappDigits(value)
  if (!digits) return ""
  if (digits.length === 9) return `${defaultCountryCode}${digits}`
  return digits
}

export function buildWhatsappLink(
  whatsapp: string,
  message?: string
): string | null {
  const digits = normalizeWhatsappDigits(whatsapp)
  if (!digits) return null

  const base = `https://wa.me/${digits}`
  if (!message) return base

  return `${base}?text=${encodeURIComponent(message)}`
}

export function buildTournamentContactMessage(tournamentTitle: string): string {
  return `Hola, te escribo por el torneo "${tournamentTitle}".`
}
