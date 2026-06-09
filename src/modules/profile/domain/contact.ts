export type OrganizerProfile = {
  name: string
  email: string
  phone: string
  whatsapp: string
  publicContact: boolean
}

export type OrganizerPublicContact = {
  name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
}

export function hasAnyPublicContact(contact: OrganizerPublicContact): boolean {
  return Boolean(contact.phone || contact.whatsapp || contact.email)
}

/** Strips everything but digits so the number works in a wa.me URL. */
export function normalizeWhatsappDigits(value: string): string {
  return value.replace(/\D/g, "")
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
