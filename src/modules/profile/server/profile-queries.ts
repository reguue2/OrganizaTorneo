import { createClient } from "@/lib/supabase/server"
import type { OrganizerProfile } from "@/modules/profile/domain"

type OrganizerProfileRow = {
  name: string | null
  email: string | null
  contact_email: string | null
  whatsapp: string | null
}

export async function getOrganizerProfile(
  userId: string,
  fallbackEmail: string
): Promise<OrganizerProfile> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("users")
    .select("name,email,contact_email,whatsapp")
    .eq("id", userId)
    .maybeSingle<OrganizerProfileRow>()

  return {
    name: data?.name ?? "",
    email: data?.email ?? fallbackEmail,
    contactEmail: data?.contact_email ?? "",
    whatsapp: data?.whatsapp ?? "",
  }
}
