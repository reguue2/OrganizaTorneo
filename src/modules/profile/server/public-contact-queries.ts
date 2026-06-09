import { createClient } from "@/lib/supabase/server"
import {
  hasAnyPublicContact,
  type OrganizerPublicContact,
} from "@/modules/profile/domain"

export async function getPublicOrganizerContact(
  tournamentId: string
): Promise<OrganizerPublicContact | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_public_organizer_contact", {
    p_tournament_id: tournamentId,
  })

  if (error || !data || data.length === 0) {
    return null
  }

  const row = data[0]
  const contact: OrganizerPublicContact = {
    name: row.name ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    whatsapp: row.whatsapp ?? null,
  }

  return hasAnyPublicContact(contact) ? contact : null
}
