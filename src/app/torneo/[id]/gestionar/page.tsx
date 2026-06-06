import { redirect } from "next/navigation"
import { OrganizerPage } from "@/components/layout"
import { createClient } from "@/lib/supabase/server"
import {
  getManagedTournamentDashboard,
  ManageDashboard,
} from "@/modules/organizer"

export default async function GestionarTorneoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const dashboard = await getManagedTournamentDashboard(id, user.id)

  if (!dashboard) {
    redirect("/")
  }

  if (dashboard.tournament.status === "draft") {
    redirect("/mis-torneos")
  }

  return (
    <OrganizerPage size="wide">
      <ManageDashboard
        tournament={dashboard.tournament}
        categories={dashboard.categories}
        registrations={dashboard.registrations}
        participants={dashboard.participants}
        payments={dashboard.payments}
        brackets={dashboard.brackets}
      />
    </OrganizerPage>
  )
}
