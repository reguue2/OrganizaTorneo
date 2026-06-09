"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink, RefreshCw, Trash2, Trophy } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryRow, TournamentRow } from "@/modules/organizer/domain"
import {
  BRACKET_FORMAT_LABELS,
  type TournamentBracketRow,
} from "@/modules/tournaments/domain"
import { ShareTournamentButton } from "@/modules/tournaments/ui/public-tournament/share-tournament-button"

import { areRegistrationsClosed, formatDate } from "./display"
import { GenerateBracketModal, type BracketTarget } from "./generate-bracket-modal"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function TournamentBracketPanel({
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

  return (
    <Card className="xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle>Cuadro del torneo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasBracket ? (
          <>
            <BracketSummary
              brackets={brackets}
              hasCategories={tournament.has_categories}
              targets={targets}
            />

            <div className="grid gap-2">
              <Button asChild variant="outline">
                <Link href={cuadroPath} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  Ver cuadro
                </Link>
              </Button>

              <ShareTournamentButton path={cuadroPath} title={`Cuadro · ${tournament.title}`} />

              <Button
                type="button"
                variant="ghost"
                onClick={openModal}
                disabled={generating || deleting}
              >
                <RefreshCw className="size-4" />
                {generating ? "Generando..." : "Generar / regenerar"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={() => dashboard.deleteBracket()}
                disabled={generating || deleting}
              >
                <Trash2 className="size-4" />
                {deleting ? "Eliminando..." : tournament.has_categories ? "Eliminar cuadros" : "Eliminar cuadro"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
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
          </div>
        )}

        {warning && !closed && (
          <Alert variant="warning">
            <AlertDescription>{warning}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      {modalOpen && (
        <GenerateBracketModal
          busy={generating}
          hasCategories={tournament.has_categories}
          onClose={() => setModalOpen(false)}
          onGenerate={handleGenerate}
          targets={targets}
        />
      )}
    </Card>
  )
}

function BracketSummary({
  brackets,
  hasCategories,
  targets,
}: {
  brackets: TournamentBracketRow[]
  hasCategories: boolean
  targets: BracketTarget[]
}) {
  if (!hasCategories) {
    const bracket = brackets[0]
    return (
      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {BRACKET_FORMAT_LABELS[bracket.format]}
          </span>
          <Badge variant="success">Generado</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {bracket.participant_count} participantes
        </p>
        <p className="text-xs text-muted-foreground">
          Generado el {formatDate(bracket.updated_at)}
        </p>
      </div>
    )
  }

  const bracketByCategory = new Map(
    brackets.map((bracket) => [bracket.category_id, bracket])
  )
  const generatedCount = targets.filter((target) => target.hasBracket).length

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">
        {generatedCount} de {targets.length} categorías con cuadro
      </p>
      <ul className="space-y-1.5">
        {targets.map((target) => {
          const bracket = target.categoryId
            ? bracketByCategory.get(target.categoryId)
            : undefined
          return (
            <li
              key={target.categoryId ?? "general"}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate text-foreground">{target.name}</span>
              {bracket ? (
                <Badge variant="success">
                  {BRACKET_FORMAT_LABELS[bracket.format]} · {bracket.participant_count}
                </Badge>
              ) : (
                <Badge variant="outline">Sin cuadro</Badge>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
