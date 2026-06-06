"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { OrganizerPageHeader } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OrganizerTournamentsOverview } from "@/modules/organizer/domain"

import { TournamentSection } from "./tournament-section"

type TournamentView = "active" | "finished" | "unpublished"
const TOURNAMENTS_PER_PAGE = 10

export function MyTournamentsPage({
  overview,
}: {
  overview: OrganizerTournamentsOverview
}) {
  const [activeView, setActiveView] = useState<TournamentView>("active")
  const [pages, setPages] = useState<Record<TournamentView, number>>({
    active: 1,
    finished: 1,
    unpublished: 1,
  })
  const views = useMemo(
    () =>
      [
        {
          id: "active" as const,
          label: "Activos",
          count: overview.activeTournaments.length,
          sectionTitle: "Torneos activos",
          sectionDescription: "",
          emptyTitle: "No tienes torneos activos",
          emptyDescription:
            "Cuando publiques un torneo o cierres inscripciones de uno ya existente, aparecerá aquí.",
          tournaments: overview.activeTournaments,
        },
        {
          id: "finished" as const,
          label: "Finalizados",
          count: overview.finishedTournaments.length,
          sectionTitle: "Torneos finalizados",
          sectionDescription: "Historial de torneos ya terminados.",
          emptyTitle: "No tienes torneos finalizados",
          emptyDescription:
            "Cuando llegue la fecha de un torneo, aparecerá aquí automáticamente.",
          tournaments: overview.finishedTournaments,
        },
        ...(overview.unpublishedTournaments.length > 0
          ? [
              {
                id: "unpublished" as const,
                label: "Pendientes",
                count: overview.unpublishedTournaments.length,
                sectionTitle: "Pendientes de rehacer",
                sectionDescription:
                  "Son torneos no publicados que conviene recrear con el flujo actual antes de usarlos.",
                emptyTitle: "No tienes borradores antiguos",
                emptyDescription:
                  "Los torneos no publicados pendientes de rehacer aparecerán aquí.",
                notice:
                  "Lo recomendable es rehacer estos torneos con el flujo actual y publicar una versión nueva.",
                tournaments: overview.unpublishedTournaments,
              },
            ]
          : []),
      ],
    [overview]
  )
  const selectedView = views.find((view) => view.id === activeView) ?? views[0]
  const totalPages = Math.max(
    1,
    Math.ceil(selectedView.tournaments.length / TOURNAMENTS_PER_PAGE)
  )
  const currentPage = Math.min(pages[selectedView.id], totalPages)
  const pageStart = (currentPage - 1) * TOURNAMENTS_PER_PAGE
  const paginatedTournaments = selectedView.tournaments.slice(
    pageStart,
    pageStart + TOURNAMENTS_PER_PAGE
  )
  const setCurrentPage = (page: number) => {
    setPages((current) => ({
      ...current,
      [selectedView.id]: Math.min(Math.max(page, 1), totalPages),
    }))
  }

  return (
    <div className="space-y-8">
      <OrganizerPageHeader
        title="Mis torneos"
        className="border-b-0 pb-0"
        actions={
          <Button asChild size="lg">
            <Link href="/crear-torneo">
              <Plus data-icon="inline-start" />
              Crear torneo
            </Link>
          </Button>
        }
      />

      <TournamentViewSelector
        activeView={selectedView.id}
        onViewChange={setActiveView}
        views={views}
      />

      <div
        id={`tournament-panel-${selectedView.id}`}
        role="tabpanel"
        aria-labelledby={`tournament-tab-${selectedView.id}`}
      >
        <TournamentSection
          title={selectedView.sectionTitle}
          description={selectedView.sectionDescription}
          emptyTitle={selectedView.emptyTitle}
          emptyDescription={selectedView.emptyDescription}
          notice={"notice" in selectedView ? selectedView.notice : undefined}
          tournaments={paginatedTournaments}
        />

        {selectedView.tournaments.length > TOURNAMENTS_PER_PAGE && (
          <TournamentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}

function TournamentPagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}) {
  return (
    <nav
      aria-label="Paginación de mis torneos"
      className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

function TournamentViewSelector({
  activeView,
  onViewChange,
  views,
}: {
  activeView: TournamentView
  onViewChange: (view: TournamentView) => void
  views: Array<{
    id: TournamentView
    label: string
    count: number
  }>
}) {
  const moveSelection = (
    currentIndex: number,
    direction: "first" | "last" | "next" | "previous"
  ) => {
    const lastIndex = views.length - 1
    const nextIndex =
      direction === "first"
        ? 0
        : direction === "last"
          ? lastIndex
          : direction === "next"
            ? currentIndex === lastIndex
              ? 0
              : currentIndex + 1
            : currentIndex === 0
              ? lastIndex
              : currentIndex - 1
    const nextView = views[nextIndex]

    onViewChange(nextView.id)
    window.requestAnimationFrame(() => {
      document.getElementById(`tournament-tab-${nextView.id}`)?.focus()
    })
  }

  return (
    <div
      aria-label="Filtrar torneos"
      className="flex max-w-full gap-1 overflow-x-auto border-b border-border"
      role="tablist"
    >
      {views.map((view, index) => {
        const active = view.id === activeView

        return (
          <button
            key={view.id}
            id={`tournament-tab-${view.id}`}
            type="button"
            role="tab"
            aria-controls={`tournament-panel-${view.id}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onViewChange(view.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault()
                moveSelection(index, "next")
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault()
                moveSelection(index, "previous")
              } else if (event.key === "Home") {
                event.preventDefault()
                moveSelection(index, "first")
              } else if (event.key === "End") {
                event.preventDefault()
                moveSelection(index, "last")
              }
            }}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/40",
              active
                ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{view.label}</span>
            <span
              className={cn(
                "flex min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                active
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {view.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
