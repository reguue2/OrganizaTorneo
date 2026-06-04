import { redirect } from "next/navigation"

import { OrganizerPage } from "@/components/layout"
import { createClient } from "@/lib/supabase/server"
import {
  getOrganizerTournamentsOverview,
  MyTournamentsPage,
} from "@/modules/organizer"

export default async function MisTorneosRoute() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const overview = await getOrganizerTournamentsOverview(user.id)

  return (
    <OrganizerPage size="wide">
      <MyTournamentsPage overview={overview} />
    </OrganizerPage>
  )
}
