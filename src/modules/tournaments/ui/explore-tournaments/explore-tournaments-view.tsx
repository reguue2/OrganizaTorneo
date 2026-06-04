"use client"

import Image from "next/image"
import Link from "next/link"
import { cloneElement, useMemo, type ReactElement } from "react"
import {
  CalendarDays,
  CreditCard,
  MapPin,
  Search,
  Tag,
  Users,
  X,
} from "lucide-react"

import { PublicPage, PublicPageHeader } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
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
  getExploreStatus,
  getExploreStructureLabel,
  paymentMethodLabel,
  type ExploreTournament,
} from "@/modules/tournaments/domain"
import { SPAIN_COMMUNITIES, normalizeText } from "@/shared/locations"

import { getPublicTournamentStatusVariant } from "../status-badge"

type ExploreTournamentsViewProps = {
  initialTournaments: ExploreTournament[]
  initialQuery: string
  initialProvince: string
  loadError: string | null
}

function ExploreTournamentsView({
  initialTournaments,
  initialQuery,
  initialProvince,
  loadError,
}: ExploreTournamentsViewProps) {
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

  return (
    <PublicPage size="wide" className="py-8 md:py-10">
      <PublicPageHeader
        eyebrow="Torneos públicos"
        title="Explorar torneos"
        description="Busca torneos locales publicados y entra al enlace público para consultar detalles o iniciar la inscripción."
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <form
              method="get"
              className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.7fr)_auto_auto]"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <label htmlFor="q" className="sr-only">
                  Buscar torneos
                </label>
                <Input
                  id="q"
                  name="q"
                  defaultValue={initialQuery}
                  placeholder="Torneo, zona o categoría"
                  className="pl-9"
                />
              </div>

              <div>
                <label htmlFor="province" className="sr-only">
                  Zona
                </label>
                <Select
                  id="province"
                  name="province"
                  defaultValue={initialProvince}
                >
                  <option value="">Todas las zonas</option>
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

              {hasFilters && (
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/explorar">
                    <X className="size-4" />
                    Limpiar
                  </Link>
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

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

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            {filteredTournaments.length === 1
              ? "1 torneo encontrado"
              : `${filteredTournaments.length} torneos encontrados`}
          </p>
        </div>

        {filteredTournaments.length === 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title={
              loadError
                ? "Ahora mismo no se puede cargar explorar"
                : "No hay torneos para esos filtros"
            }
            description={
              loadError
                ? "La conexión al backend no está respondiendo correctamente."
                : "Prueba otra búsqueda o amplía la zona."
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTournaments.map((tournament) => (
              <ExploreTournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}
          </div>
        )}
      </div>
    </PublicPage>
  )
}

function ExploreTournamentCard({
  tournament,
}: {
  tournament: ExploreTournament
}) {
  const status = getExploreStatus(tournament)

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
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

      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge variant={getPublicTournamentStatusVariant(status.state)}>
            {status.label}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" />
            {tournament.province ?? "Zona por definir"}
          </span>
        </div>

        <div>
          <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground">
            {tournament.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            {formatDate(tournament.date)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <TournamentMetaItem icon={<Tag />} text={getExploreStructureLabel(tournament)} />
        <TournamentMetaItem icon={<Users />} text={getExploreCapacityLabel(tournament)} />
        <TournamentMetaItem icon={<CreditCard />} text={getExplorePriceLabel(tournament)} />
        <TournamentMetaItem
          icon={<CreditCard />}
          text={paymentMethodLabel(tournament.payment_method)}
        />
        <TournamentMetaItem
          icon={<CalendarDays />}
          text={`Límite de inscripción: ${formatDate(tournament.registration_deadline)}`}
        />
      </CardContent>

      <CardFooter>
        <Button asChild size="lg" className="w-full">
          <Link href={`/torneos/${tournament.id}`}>Ver torneo</Link>
        </Button>
      </CardFooter>
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
    <p className="flex items-start gap-2">
      {cloneElement(icon, {
        className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
      })}
      <span>{text}</span>
    </p>
  )
}

export { ExploreTournamentsView }
