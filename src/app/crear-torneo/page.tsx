import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  OrganizerPage,
  OrganizerPageHeader,
} from "@/components/layout"
import { getOrganizerProfile } from "@/modules/profile/server"
import { CreateTournamentForm } from "@/modules/tournaments/ui"

export default async function CrearTorneoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await getOrganizerProfile(user.id, user.email ?? "")

  return (
    <OrganizerPage size="wide">
      <OrganizerPageHeader
        title="Crear torneo"
        description="Configura tu torneo y publícalo cuando completes los datos."
      />
      <CreateTournamentForm
        profileContact={{
          name: profile.name,
          whatsapp: profile.whatsapp,
          contactEmail: profile.contactEmail,
        }}
      />
    </OrganizerPage>
  )
}
