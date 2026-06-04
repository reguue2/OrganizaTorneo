import { listPublishedPublicTournaments } from "@/modules/tournaments/server"
import { ExploreTournamentsView } from "@/modules/tournaments/ui"

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; province?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ""
  const province = params.province ?? ""
  const page = Number(params.page ?? "1")
  const result = await listPublishedPublicTournaments({ province })

  return (
    <ExploreTournamentsView
      key={`${q}-${province}-${page}`}
      initialTournaments={result.data}
      initialPage={Number.isInteger(page) && page > 0 ? page : 1}
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
