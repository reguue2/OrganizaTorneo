"use client"

import Image from "next/image"
import Link from "next/link"
import {
  cloneElement,
  useMemo,
  useState,
  type ReactElement,
} from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Euro,
  MapPin,
  Search,
  Tag,
  Users,
} from "lucide-react"

import { PublicPage, PublicPageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  formatDate,
  getExploreCapacityLabel,
  getExplorePriceLabel,
  getExploreStructureLabel,
  paymentMethodLabel,
  type ExploreTournament,
} from "@/modules/tournaments/domain"
import { SPAIN_COMMUNITIES, normalizeText } from "@/shared/locations"

const EXPLORE_TOURNAMENTS_PAGE_SIZE = 12

type ExploreTournamentsViewProps = {
  initialTournaments: ExploreTournament[]
  initialPage: number
  initialQuery: string
  initialProvince: string
  loadError: string | null
}

function ExploreTournamentsView({
  initialTournaments,
  initialPage,
  initialQuery,
  initialProvince,
  loadError,
}: ExploreTournamentsViewProps) {
  const [query, setQuery] = useState(initialQuery)
  const [province, setProvince] = useState(initialProvince)

  const filteredTournaments = useMemo(() => {
    const normalizedQuery = normalizeText(initialQuery)

    return initialTournaments.filter((tournament) => {
      if (!normalizedQuery) return true

      const haystack = [
        tournament.title,
        tournament.province ?? "",
        ...(tournament.categories ?? []).map((category) => category.name),
      ]
        .map((value) => normalizeText(value))
        .join(" ")

      return haystack.includes(normalizedQuery)
    })
  }, [initialQuery, initialTournaments])

  const hasFilters = Boolean(initialQuery || initialProvince)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTournaments.length / EXPLORE_TOURNAMENTS_PAGE_SIZE)
  )
  const currentPage = Math.min(Math.max(initialPage, 1), totalPages)
  const pageStart = (currentPage - 1) * EXPLORE_TOURNAMENTS_PAGE_SIZE
  const paginatedTournaments = filteredTournaments.slice(
    pageStart,
    pageStart + EXPLORE_TOURNAMENTS_PAGE_SIZE
  )
  const hasPagination = filteredTournaments.length > EXPLORE_TOURNAMENTS_PAGE_SIZE
  const previousPageHref = createExplorePageHref({
    page: currentPage - 1,
    province: initialProvince,
    query: initialQuery,
  })
  const nextPageHref = createExplorePageHref({
    page: currentPage + 1,
    province: initialProvince,
    query: initialQuery,
  })

  return (
    <PublicPage size="wide" className="py-8 md:py-10">
      <PublicPageHeader
        title="Explorar torneos"
        description="Busca torneos publicados y entra para consultar detalles o iniciar la inscripción."
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <form
              method="get"
              className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.7fr)_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <label htmlFor="q" className="sr-only">
                  Buscar torneos
                </label>
                <Input
                  id="q"
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Torneo, zona o categoría"
                  className="pl-9"
                />
              </div>

              <div>
                <label htmlFor="province" className="sr-only">
                  Provincia
                </label>
                <Select
                  id="province"
                  name="province"
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                >
                  <option value="">Selecciona provincia</option>
                  {SPAIN_COMMUNITIES.map((provinceOption) => (
                    <option key={provinceOption} value={provinceOption}>
                      {provinceOption}
                    </option>
                  ))}
                </Select>
              </div>

              <Button type="submit" size="lg">
                Filtrar
              </Button>
            </form>
          </CardContent>
        </Card>

        {hasFilters && (
          <p className="text-sm text-muted-foreground">
            <Link
              href="/explorar"
              className="font-medium text-primary underline-offset-4 transition hover:underline"
            >
              Limpiar filtros
            </Link>
          </p>
        )}

        {loadError && (
          <Card className="border-amber-200 bg-amber-50 text-amber-950">
            <CardHeader>
              <p className="text-base font-semibold">
                No se ha podido cargar el listado
              </p>
              <p className="text-sm">{loadError}</p>
            </CardHeader>
          </Card>
        )}

        {filteredTournaments.length === 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title={
              loadError
                ? "Ahora mismo no se puede cargar explorar"
                : "No se ha encontrado ningún torneo"
            }
            description={
              loadError
                ? "La conexión al backend no está respondiendo correctamente."
                : ""
            }
          />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {paginatedTournaments.map((tournament) => (
                <ExploreTournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              ))}
            </div>

            {hasPagination && (
              <nav
                aria-label="Paginación de torneos"
                className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </p>

                <div className="flex gap-2">
                  {currentPage > 1 ? (
                    <Button variant="outline" size="lg" asChild>
                      <Link href={previousPageHref}>
                        <ChevronLeft className="size-4" />
                        Anterior
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="lg" disabled>
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>
                  )}

                  {currentPage < totalPages ? (
                    <Button variant="outline" size="lg" asChild>
                      <Link href={nextPageHref}>
                        Siguiente
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" size="lg" disabled>
                      Siguiente
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </PublicPage>
  )
}

function createExplorePageHref({
  page,
  province,
  query,
}: {
  page: number
  province: string
  query: string
}) {
  const params = new URLSearchParams()
  const normalizedQuery = query.trim()
  const normalizedProvince = province.trim()

  if (normalizedQuery) params.set("q", normalizedQuery)
  if (normalizedProvince) params.set("province", normalizedProvince)
  if (page > 1) params.set("page", String(page))

  const queryString = params.toString()
  return queryString ? `/explorar?${queryString}` : "/explorar"
}

function ExploreTournamentCard({
  tournament,
}: {
  tournament: ExploreTournament
}) {
  return (
    <Card className="flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-muted">
        {tournament.poster_url ? (
          <Image
            src={tournament.poster_url}
            alt={tournament.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sin cartel
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <CardHeader className="pb-3">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <h2
              className="min-w-0 flex-1 truncate text-xl font-semibold tracking-tight text-foreground"
              title={tournament.title}
            >
              {tournament.title}
            </h2>
            <span className="inline-flex max-w-28 shrink-0 items-center gap-1 truncate text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                {tournament.province ?? "Zona por definir"}
              </span>
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            {formatDate(tournament.date)}
          </p>
        </CardHeader>

        <CardContent className="space-y-2.5 pt-0 text-sm text-muted-foreground">
          <TournamentMetaItem icon={<Tag />} text={getExploreStructureLabel(tournament)} />
          <TournamentMetaItem icon={<Users />} text={getExploreCapacityLabel(tournament)} />
          <TournamentMetaItem icon={<Euro />} text={getExplorePriceLabel(tournament)} />
          <TournamentMetaItem
            icon={<CreditCard />}
            text={paymentMethodLabel(tournament.payment_method)}
          />
          <TournamentMetaItem
            icon={<CalendarDays />}
            text={`Límite de inscripción: ${formatDate(tournament.registration_deadline)}`}
          />
        </CardContent>

        <CardFooter className="mt-auto">
          <Button asChild size="lg" className="w-full">
            <Link href={`/torneos/${tournament.id}`}>Ver torneo</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}

function TournamentMetaItem({
  icon,
  text,
}: {
  icon: ReactElement<{ className?: string }>
  text: string
}) {
  return (
    <p className="flex items-start gap-2 leading-5">
      {cloneElement(icon, {
        className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
      })}
      <span>{text}</span>
    </p>
  )
}

export { ExploreTournamentsView }
