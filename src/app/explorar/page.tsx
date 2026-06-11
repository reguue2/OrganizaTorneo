import { listPublishedPublicTournaments } from "@/modules/tournaments/server"
import { ExploreTournamentsView } from "@/modules/tournaments/ui"
import { parseIntegerInput } from "@/shared/forms/numbers"

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; province?: string }>
}) {
  const params = await searchParams
  const q = params.q ?? ""
  const province = params.province ?? ""
  const page = parseIntegerInput(params.page ?? "1", { min: 1 }) ?? 1
  const result = await listPublishedPublicTournaments({ province })

  return (
    <ExploreTournamentsView
      key={`${q}-${province}-${page}`}
      initialTournaments={result.data}
      initialPage={page}
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
