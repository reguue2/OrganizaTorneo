"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getOrganizerTournamentOperationalState,
  type TournamentRow,
} from "@/modules/organizer/domain"

import { canReopenTournament } from "./display"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

export function TournamentStatusActions({
  busy,
  tournament,
  updateTournamentStatus,
}: {
  busy: string | null
  tournament: TournamentRow
  updateTournamentStatus: ManageDashboardViewModel["updateTournamentStatus"]
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const operationalState = getOrganizerTournamentOperationalState(tournament)

  useEffect(() => {
    if (!deleteModalOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && busy !== "status:cancelled") {
        setDeleteModalOpen(false)
      }
    }

    document.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [busy, deleteModalOpen])

  if (
    operationalState !== "registrations_open" &&
    operationalState !== "registrations_closed"
  ) {
    return null
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        {operationalState === "registrations_open" && (
          <Button
            type="button"
            onClick={() => updateTournamentStatus("closed")}
            disabled={busy === "status:closed"}
            className="border-amber-200 bg-amber-50 text-black hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-black dark:hover:bg-amber-950/70"
          >
            {busy === "status:closed" ? "Cerrando..." : "Cerrar inscripciones"}
          </Button>
        )}

        {operationalState === "registrations_closed" &&
          tournament.status === "closed" && (
          <Button
            type="button"
            onClick={() => updateTournamentStatus("published")}
            disabled={busy === "status:published" || !canReopenTournament(tournament)}
            className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {busy === "status:published" ? "Reabriendo..." : "Reabrir inscripciones"}
          </Button>
        )}

        <Button
          type="button"
          variant="destructive"
          className="border-red-300 text-black dark:border-red-800 dark:text-black"
          onClick={() => setDeleteModalOpen(true)}
        >
          Eliminar torneo
        </Button>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar confirmación"
            className="absolute inset-0 bg-foreground/45"
            disabled={busy === "status:cancelled"}
            onClick={() => setDeleteModalOpen(false)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-tournament-title"
              className="relative w-full max-w-lg shadow-2xl"
            >
              <CardHeader className="pr-16">
                <CardTitle id="delete-tournament-title">¿Eliminar este torneo?</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  className="absolute right-4 top-4"
                  disabled={busy === "status:cancelled"}
                  onClick={() => setDeleteModalOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">{tournament.title}</strong> dejará
                    de estar publicado y ya no aparecerá en mis torneos.
                  </p>
                  <p>
                    Las inscripciones, participantes y pagos se eliminarán y no podrán ser recuperados.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy === "status:cancelled"}
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Mantener torneo
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="border-red-300 text-black dark:border-red-800 dark:text-black"
                    disabled={busy === "status:cancelled"}
                    onClick={() => updateTournamentStatus("cancelled")}
                  >
                    {busy === "status:cancelled" ? "Eliminando..." : "Eliminar torneo"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
