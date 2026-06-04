import Image from "next/image"
import { ImageIcon } from "lucide-react"
import type { RefObject } from "react"

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
  onDraftChange: UpdateCreateTournamentDraftValue
}

function DetailsStep({
  draft,
  errors,
  fileInputRef,
  posterName,
  posterPreview,
  onDraftChange,
}: DetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles finales</CardTitle>
        <CardDescription>Pago, premios, reglas, visibilidad y cartel.</CardDescription>
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
              <option value="private">Privado por enlace</option>
            </Select>
          </FormField>

          <FormField label="Premios">
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
              <option value="per_category" disabled={!draft.has_categories}>
                Por categoría
              </option>
            </Select>
          </FormField>

          <FormField label="Cartel opcional" error={errors.poster}>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="size-4" />
                Seleccionar cartel
              </Button>
              {posterName && (
                <span className="max-w-full truncate text-sm text-muted-foreground">
                  {posterName}
                </span>
              )}
            </div>
          </FormField>
        </div>

        {draft.prize_mode === "global" && (
          <FormField label="Premios globales" error={errors.prizes}>
            <Textarea
              value={draft.prizes}
              onChange={(event) => onDraftChange("prizes", event.target.value)}
            />
          </FormField>
        )}

        {draft.prize_mode === "per_category" && errors.categories && (
          <Alert variant="warning">
            <AlertDescription>{errors.categories}</AlertDescription>
          </Alert>
        )}

        <FormField label="Reglas">
          <Textarea
            value={draft.rules}
            onChange={(event) => onDraftChange("rules", event.target.value)}
            placeholder="Reglas, horarios, material necesario..."
          />
        </FormField>

        {posterPreview ? (
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={posterPreview}
              alt="Vista previa del cartel"
              width={960}
              height={320}
              unoptimized
              className="h-72 w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
            <ImageIcon className="mr-2 size-4" />
            Sin cartel seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { DetailsStep }
