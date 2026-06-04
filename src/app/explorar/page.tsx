import { listPublishedPublicTournaments } from "@/modules/tournaments/server"
import { ExploreTournamentsView } from "@/modules/tournaments/ui"

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ""
  const province = params.province ?? ""
  const result = await listPublishedPublicTournaments({ province })

  return (
    <ExploreTournamentsView
      initialTournaments={result.data}
      initialQuery={q}
      initialProvince={province}
      loadError={
        result.error
          ? "No se han podido cargar los torneos ahora mismo. Inténtalo de nuevo en un momento."
          : null
      }
    />
  )
}
