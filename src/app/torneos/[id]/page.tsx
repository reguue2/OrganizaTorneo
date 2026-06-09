import { notFound } from "next/navigation"
import { getPublicTournamentDetail } from "@/modules/tournaments/server"
import { PublicTournamentPage } from "@/modules/tournaments/ui"
import { getPublicOrganizerContact } from "@/modules/profile/server"

export default async function TorneoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [publicTournament, contact] = await Promise.all([
    getPublicTournamentDetail(id),
    getPublicOrganizerContact(id),
  ])

  if (!publicTournament) {
    notFound()
  }

  return (
    <PublicTournamentPage
      tournament={publicTournament.tournament}
      categories={publicTournament.categories}
      contact={contact}
    />
  )
}
