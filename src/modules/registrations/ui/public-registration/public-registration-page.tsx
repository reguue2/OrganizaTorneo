import Link from "next/link"
import { CalendarDays, ChevronRight, CreditCard, Eye, MapPin, Users } from "lucide-react"

import { PublicPage } from "@/components/layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDate,
  formatMoney,
  getParticipantTypeLabel,
  getPublicVisibilityLabel,
  getRegistrationState,
  type RegistrationCategory,
  type RegistrationTournament,
} from "@/modules/tournaments/domain"

import RegisterForm from "./register-form"

type PublicRegistrationPageProps = {
  tournament: RegistrationTournament
  categories: RegistrationCategory[]
}

function PublicRegistrationPage({
  tournament,
  categories,
}: PublicRegistrationPageProps) {
  const registrationState = getRegistrationState(tournament)
  const hasValidParticipantConfig = tournament.has_categories
    ? categories.length > 0 && categories.every((category) => Boolean(category.participant_type))
    : Boolean(tournament.participant_type)

  return (
    <PublicPage size="wide" className="py-6 md:py-8">
      <div className="space-y-6">
        <nav
          aria-label="Ruta de navegación"
          className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            href={`/torneos/${tournament.id}`}
            className="transition-colors hover:text-foreground"
          >
            Volver al torneo
          </Link>
          <ChevronRight className="size-4 shrink-0" />
          <span className="truncate">Inscripción</span>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <header>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Inscribirse al torneo
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {tournament.title}
              </p>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>{registrationState.title}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  {registrationState.message}
                </p>
              </CardHeader>
              <CardContent>
                {registrationState.canJoin && hasValidParticipantConfig ? (
                  <RegisterForm
                    tournamentId={tournament.id}
                    tournamentTitle={tournament.title}
                    hasCategories={tournament.has_categories}
                    tournamentParticipantType={tournament.participant_type}
                    categories={categories}
                    entryPrice={tournament.entry_price}
                    paymentMethod={tournament.payment_method}
                  />
                ) : registrationState.canJoin ? (
                  <Alert variant="warning">
                    <AlertDescription>
                      El organizador todavía no ha terminado de configurar el formato de inscripción.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="warning">
                    <AlertDescription>
                      Ahora mismo no puedes completar la inscripción desde esta página.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <RegistrationSummarySidebar
            tournament={tournament}
            categories={categories}
          />
        </section>
      </div>
    </PublicPage>
  )
}

function RegistrationSummarySidebar({
  tournament,
  categories,
}: PublicRegistrationPageProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardContent className="space-y-5 p-5">
          <SummaryItem label="Torneo" value={tournament.title} />
          <SummaryItem
            icon={<MapPin className="size-4" />}
            label="Ubicación"
            value={`${tournament.province ?? "Por definir"}${
              tournament.address ? ` · ${tournament.address}` : ""
            }`}
          />
          <SummaryItem
            icon={<CalendarDays className="size-4" />}
            label="Fecha"
            value={formatDate(tournament.date)}
          />
          <SummaryItem
            icon={<CalendarDays className="size-4" />}
            label="Fecha límite de inscripción"
            value={formatDate(tournament.registration_deadline)}
          />
          <SummaryItem
            icon={<CreditCard className="size-4" />}
            label="Precio base"
            value={
              tournament.has_categories
                ? "Según categoría"
                : formatMoney(tournament.entry_price)
            }
          />
          <SummaryItem
            icon={<Users className="size-4" />}
            label="Formato de inscripción"
            value={
              tournament.has_categories
                ? "Según categoría"
                : getParticipantTypeLabel(tournament.participant_type)
            }
          />

          {tournament.has_categories && categories.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Categorías disponibles</p>
              <div className="mt-2 space-y-2 text-sm">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-lg border border-border bg-muted p-3">
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getParticipantTypeLabel(category.participant_type)} ·{" "}
                      {formatMoney(category.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SummaryItem
            icon={<Eye className="size-4" />}
            label="Visibilidad"
            value={getPublicVisibilityLabel(tournament.is_public)}
          />

          <div>
            <p className="text-sm text-muted-foreground">Cómo funciona ahora</p>
            <p className="mt-1 text-sm leading-6 text-foreground">
              Primero validas el email. Después se crea la inscripción real y, si corresponde,
              el organizador validará el pago en efectivo o seguirás el flujo online cuando
              esté conectado.
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium leading-6 text-foreground">{value}</p>
    </div>
  )
}

export { PublicRegistrationPage }
