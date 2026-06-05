"use client"

import { useState, type ReactNode } from "react"
import { CalendarDays, CreditCard, MapPin, Users } from "lucide-react"

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
  const registrationTitle = registrationState.canJoin
    ? `Inscripción para el ${tournament.title}`
    : registrationState.title
  const registrationDescription = registrationState.canJoin
    ? "Rellena tus datos para inscribirte al torneo."
    : registrationState.message
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    tournament.has_categories && categories.length === 1 ? categories[0].id : ""
  )
  const hasValidParticipantConfig = tournament.has_categories
    ? categories.length > 0 && categories.every((category) => Boolean(category.participant_type))
    : Boolean(tournament.participant_type)

  return (
    <PublicPage size="wide" className="py-6 md:py-8">
      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl leading-tight tracking-tight md:text-3xl">
                  {registrationTitle}
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  {registrationDescription}
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
                    onCategoryChange={setSelectedCategoryId}
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
            selectedCategoryId={selectedCategoryId}
          />
        </section>
      </div>
    </PublicPage>
  )
}

function RegistrationSummarySidebar({
  tournament,
  categories,
  selectedCategoryId,
}: PublicRegistrationPageProps & {
  selectedCategoryId: string
}) {
  const selectedCategory = tournament.has_categories
    ? categories.find((category) => category.id === selectedCategoryId) ?? null
    : null
  const categoryDependentValue = "Selecciona categoría"

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card>
        <CardContent className="space-y-5 p-5">
          <SummaryItem
            icon={<MapPin className="size-4" />}
            label="Ubicación"
            value={`${tournament.province ?? "Por definir"}${
              tournament.address ? `, ${tournament.address}` : ""
            }`}
          />
          <SummaryItem
            icon={<CalendarDays className="size-4" />}
            label="Fecha"
            value={formatDate(tournament.date, { withTime: true })}
          />
          <SummaryItem
            icon={<CreditCard className="size-4" />}
            label="Precio"
            value={
              tournament.has_categories
                ? selectedCategory
                  ? formatMoney(selectedCategory.price)
                  : categoryDependentValue
                : formatMoney(tournament.entry_price)
            }
          />
          <SummaryItem
            icon={<Users className="size-4" />}
            label="Formato de inscripción"
            value={
              tournament.has_categories
                ? selectedCategory
                  ? getParticipantTypeLabel(selectedCategory.participant_type)
                  : categoryDependentValue
                : getParticipantTypeLabel(tournament.participant_type)
            }
          />
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
  icon?: ReactNode
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
