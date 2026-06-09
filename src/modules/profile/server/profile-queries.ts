import { createClient } from "@/lib/supabase/server"
import type { OrganizerProfile } from "@/modules/profile/domain"

type OrganizerProfileRow = {
  name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  public_contact: boolean | null
}

export async function getOrganizerProfile(
  userId: string,
  fallbackEmail: string
): Promise<OrganizerProfile> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("users")
    .select("name,email,phone,whatsapp,public_contact")
    .eq("id", userId)
    .maybeSingle<OrganizerProfileRow>()

  return {
    name: data?.name ?? "",
    email: data?.email ?? fallbackEmail,
    phone: data?.phone ?? "",
    whatsapp: data?.whatsapp ?? "",
    publicContact: data?.public_contact ?? false,
  }
}
