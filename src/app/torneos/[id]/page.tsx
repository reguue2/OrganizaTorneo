import { notFound } from "next/navigation"
import { getPublicTournamentDetail } from "@/modules/tournaments/server"
import { PublicTournamentPage } from "@/modules/tournaments/ui"

export default async function TorneoPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const publicTournament = await getPublicTournamentDetail(id)

  if (!publicTournament) {
    notFound()
  }

  return (
    <PublicTournamentPage
      tournament={publicTournament.tournament}
      categories={publicTournament.categories}
    />
  )
}
