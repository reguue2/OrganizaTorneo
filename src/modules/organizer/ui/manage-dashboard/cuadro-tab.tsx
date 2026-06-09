"use client"

import { useState } from "react"
import { RefreshCw, Trash2, Trophy } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"
import {
  BRACKET_FORMAT_LABELS,
  type TournamentBracketRow,
} from "@/modules/tournaments/domain"
import { BracketView } from "@/modules/tournaments/ui/bracket"
import { ShareTournamentButton } from "@/modules/tournaments/ui/public-tournament/share-tournament-button"

import { areRegistrationsClosed } from "./display"
import { GenerateBracketModal, type BracketTarget } from "./generate-bracket-modal"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

function bracketKey(categoryId: string | null) {
  return categoryId ?? "__general__"
}

export function CuadroTab({
  categories,
  dashboard,
  tournament,
}: {
  categories: CategoryRow[]
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const closed = areRegistrationsClosed(tournament)
  const brackets = dashboard.brackets
  const hasBracket = brackets.length > 0
  const generating = dashboard.busy === "bracket:generate"
  const deleting = dashboard.busy === "bracket:delete"
  const cuadroPath = `/torneos/${tournament.id}/cuadro`

  const confirmedByCategory = new Map<string | null, number>()
  for (const view of dashboard.confirmedRegistrations) {
    const key = view.registration.category_id
    confirmedByCategory.set(key, (confirmedByCategory.get(key) ?? 0) + 1)
  }

  const pendingByCategory = new Map<string | null, number>()
  for (const view of [
    ...dashboard.pendingCashValidations,
    ...dashboard.pendingOnlinePayments,
  ]) {
    const key = view.registration.category_id
    pendingByCategory.set(key, (pendingByCategory.get(key) ?? 0) + 1)
  }

  const bracketByCategory = new Map<string | null, TournamentBracketRow>()
  for (const bracket of brackets) {
    bracketByCategory.set(bracket.category_id, bracket)
  }

  const targets: BracketTarget[] = tournament.has_categories
    ? categories.map((category) => ({
        categoryId: category.id,
        name: category.name,
        confirmedCount: confirmedByCategory.get(category.id) ?? 0,
        pendingCount: pendingByCategory.get(category.id) ?? 0,
        hasBracket: bracketByCategory.has(category.id),
      }))
    : [
        {
          categoryId: null,
          name: "Cuadro general",
          confirmedCount: dashboard.confirmedRegistrations.length,
          pendingCount:
            dashboard.pendingCashValidations.length +
            dashboard.pendingOnlinePayments.length,
          hasBracket: bracketByCategory.has(null),
        },
      ]

  const categoryName = new Map(categories.map((category) => [category.id, category.name]))
  const nameFor = (bracket: TournamentBracketRow) =>
    bracket.category_id
      ? categoryName.get(bracket.category_id) ?? "Categoría"
      : "Cuadro general"

  const ordered = [...brackets].sort((a, b) => nameFor(a).localeCompare(nameFor(b)))
  const active =
    ordered.find((bracket) => bracketKey(bracket.category_id) === activeKey) ?? ordered[0]

  function openModal() {
    if (!closed) {
      setWarning("Cierra las inscripciones del torneo para poder generar el cuadro.")
      return
    }
    setWarning(null)
    setModalOpen(true)
  }

  function handleGenerate(configs: Parameters<ManageDashboardViewModel["generateBracket"]>[0]) {
    setModalOpen(false)
    dashboard.generateBracket(configs)
  }

  const modal = modalOpen && (
    <GenerateBracketModal
      busy={generating}
      hasCategories={tournament.has_categories}
      onClose={() => setModalOpen(false)}
      onGenerate={handleGenerate}
      targets={targets}
    />
  )

  if (!hasBracket || !active) {
    return (
      <>
        <div className="mx-auto max-w-md">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Trophy className="size-6" />
              </span>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Genera el cuadro de juego</p>
                <p className="text-sm text-muted-foreground">
                  {tournament.has_categories
                    ? "Elige qué categorías generar y el formato de cada una con los participantes confirmados."
                    : "Crea el cuadro, la liga o la fase de grupos con los participantes confirmados."}
                </p>
              </div>
              <Button type="button" onClick={openModal} disabled={generating}>
                <Trophy className="size-4" />
                {generating ? "Generando..." : "Generar cuadro de torneo"}
              </Button>
              {warning && !closed && (
                <Alert variant="warning" className="text-left">
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {modal}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
        {ordered.length > 1 ? (
          <div
            role="tablist"
            aria-label="Cuadros por categoría"
            className="flex max-w-full gap-1 overflow-x-auto"
          >
            {ordered.map((bracket) => {
              const key = bracketKey(bracket.category_id)
              const isActive = key === bracketKey(active.category_id)
              return (
                <Button
                  key={bracket.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  variant="ghost"
                  className={cn(
                    "shrink-0 rounded-none border-0 bg-transparent hover:bg-transparent",
                    isActive &&
                      "relative after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
                  )}
                  onClick={() => setActiveKey(key)}
                >
                  {nameFor(bracket)}
                </Button>
              )
            })}
          </div>
        ) : (
          <span />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <ShareTournamentButton
            path={cuadroPath}
            title={`Cuadro · ${tournament.title}`}
            variant="inline"
            label="Compartir cuadro"
          />
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={openModal}
            disabled={generating || deleting}
          >
            <RefreshCw className="size-4" />
            {generating ? "Generando..." : "Generar / regenerar"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={() => dashboard.deleteBracket()}
            disabled={generating || deleting}
          >
            <Trash2 className="size-4" />
            {deleting
              ? "Eliminando..."
              : tournament.has_categories
                ? "Eliminar cuadros"
                : "Eliminar cuadro"}
          </Button>
        </div>
      </div>

      {warning && !closed && (
        <Alert variant="warning">
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex justify-end">
            <Badge variant="secondary">{BRACKET_FORMAT_LABELS[active.format]}</Badge>
          </div>
          <BracketView structure={active.structure} />
        </CardContent>
      </Card>

      {modal}
    </div>
  )
}
