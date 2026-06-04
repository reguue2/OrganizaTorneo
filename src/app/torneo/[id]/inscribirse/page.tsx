import { notFound } from "next/navigation"
import { PublicRegistrationPage } from "@/modules/registrations/ui"
import { getRegistrationTournamentConfig } from "@/modules/tournaments/server"

export default async function InscribirsePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const registrationConfig = await getRegistrationTournamentConfig(id)

  if (!registrationConfig) {
    notFound()
  }

  return (
    <PublicRegistrationPage
      tournament={registrationConfig.tournament}
      categories={registrationConfig.categories}
    />
  )
}
