import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  OrganizerPage,
  OrganizerPageHeader,
} from "@/components/layout"
import { CreateTournamentForm } from "@/modules/tournaments/ui"

export default async function CrearTorneoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <OrganizerPage size="wide">
      <OrganizerPageHeader
        title="Crear torneo"
        description="Configura tu torneo y publícalo cuando completes los datos."
      />
      <CreateTournamentForm />
    </OrganizerPage>
  )
}
