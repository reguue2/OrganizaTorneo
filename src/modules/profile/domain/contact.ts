import { normalizeWhatsappToInternational } from "@/shared/contact/phone"

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

export { normalizeWhatsappToInternational }

export function buildWhatsappLink(
  whatsapp: string,
  message?: string
): string | null {
  const digits = normalizeWhatsappToInternational(whatsapp)
  if (!digits) return null

  const base = `https://wa.me/${digits}`
  if (!message) return base

  return `${base}?text=${encodeURIComponent(message)}`
}

export function buildTournamentContactMessage(tournamentTitle: string): string {
  return `Hola, te escribo por el torneo "${tournamentTitle}".`
}
