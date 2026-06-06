import { notFound } from "next/navigation"

import { getPublicTournamentBrackets } from "@/modules/tournaments/server"
import { PublicBracketPage } from "@/modules/tournaments/ui"

export default async function CuadroPublicoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getPublicTournamentBrackets(id)

  if (!data) {
    notFound()
  }

  return (
    <PublicBracketPage
      tournament={data.tournament}
      categories={data.categories}
      brackets={data.brackets}
    />
  )
}
