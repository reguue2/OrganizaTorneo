"use client"

import Image from "next/image"
import { ImageIcon, Upload, X } from "lucide-react"
import { useState, type DragEvent, type RefObject } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { FormField } from "../form-field"
import type {
  CreateTournamentDraft,
  CreateTournamentErrors,
  UpdateCreateTournamentDraftValue,
} from "../types"

type DetailsStepProps = {
  draft: CreateTournamentDraft
  errors: CreateTournamentErrors
  fileInputRef: RefObject<HTMLInputElement | null>
  posterName: string
  posterPreview: string | null
  onClearPoster: () => void
  onDraftChange: UpdateCreateTournamentDraftValue
  onPosterDrop: (file: File) => void
}

function DetailsStep({
  draft,
  errors,
  fileInputRef,
  posterName,
  posterPreview,
  onClearPoster,
  onDraftChange,
  onPosterDrop,
}: DetailsStepProps) {
  const [draggingPoster, setDraggingPoster] = useState(false)

  const setCategoryPrizes = (categoryId: string, prizes: string) => {
    onDraftChange(
      "categories",
      draft.categories.map((category) =>
        category.id === categoryId ? { ...category, prizes } : category
      )
    )
  }

  const dropPoster = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDraggingPoster(false)

    const file = event.dataTransfer.files[0]
    if (file) onPosterDrop(file)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicación</CardTitle>
        <CardDescription>
          Pago, visibilidad, premios, normas y cartel del torneo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Método de pago">
            <Select
              value={draft.payment_method}
              onChange={(event) =>
                onDraftChange(
                  "payment_method",
                  event.target.value as CreateTournamentDraft["payment_method"]
                )
              }
            >
              <option value="cash">Efectivo</option>
              <option value="online">Online</option>
              <option value="both">Efectivo y online</option>
            </Select>
          </FormField>

          <FormField label="Visibilidad">
            <Select
              value={draft.is_public ? "public" : "private"}
              onChange={(event) =>
                onDraftChange("is_public", event.target.value === "public")
              }
            >
              <option value="public">Público</option>
              <option value="private">Solo con enlace</option>
            </Select>
          </FormField>

          <FormField label="Premios del torneo">
            <Select
              value={draft.prize_mode}
              onChange={(event) =>
                onDraftChange(
                  "prize_mode",
                  event.target.value as CreateTournamentDraft["prize_mode"]
                )
              }
            >
              <option value="none">Sin premios</option>
              <option value="global">Premios globales</option>
              {draft.has_categories && (
                <option value="per_category">Por categoría</option>
              )}
            </Select>
          </FormField>

        </div>

        {draft.prize_mode === "global" && (
          <FormField label="Premios globales" error={errors.prizes}>
            <Textarea
              value={draft.prizes}
              onChange={(event) => onDraftChange("prizes", event.target.value)}
              className="resize-none"
            />
          </FormField>
        )}

        {draft.prize_mode === "per_category" && errors.categories && (
          <Alert variant="warning">
            <AlertDescription>{errors.categories}</AlertDescription>
          </Alert>
        )}

        {draft.prize_mode === "per_category" && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
            <div>
              <h3 className="font-medium text-foreground">Premios por categoría</h3>
            </div>

            <div className="grid gap-4">
              {draft.categories.map((category) => (
                <FormField key={category.id} label={category.name}>
                  <Textarea
                    value={category.prizes}
                    onChange={(event) =>
                      setCategoryPrizes(category.id, event.target.value)
                    }
                    className="resize-none"
                  />
                </FormField>
              ))}
            </div>
          </div>
        )}

        <FormField label="Normas e información útil">
          <Textarea
            value={draft.rules}
            onChange={(event) => onDraftChange("rules", event.target.value)}
            className="resize-none"
          />
        </FormField>

        <FormField label="Cartel del torneo" error={errors.poster}>
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDraggingPoster(true)
            }}
            onDragLeave={() => setDraggingPoster(false)}
            onDrop={dropPoster}
            className={
              "overflow-hidden rounded-lg border border-dashed transition " +
              (draggingPoster
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30")
            }
          >
            {posterPreview ? (
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative aspect-[16/7] min-h-56 bg-muted">
                  <Image
                    src={posterPreview}
                    alt="Vista previa del cartel"
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>

                <div className="flex flex-col justify-between gap-4 border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
                  <div className="min-w-0 space-y-2">
                    <p className="font-medium text-foreground">Cartel seleccionado</p>
                    {posterName && (
                      <p className="truncate text-sm text-muted-foreground">
                        {posterName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-4" />
                      Cambiar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onClearPoster}
                    >
                      <X className="size-4" />
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-56 w-full flex-col items-center justify-center gap-3 p-8 text-center transition hover:bg-muted/60"
              >
                <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs">
                  <ImageIcon className="size-5" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm text-muted-foreground">
                    Haz clic o arrastra una imagen aquí.
                  </span>
                </span>
              </button>
            )}
          </div>
        </FormField>
      </CardContent>
    </Card>
  )
}

export { DetailsStep }
