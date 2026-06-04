import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { FormField } from "../form-field"
import type {
  CreateTournamentDraft,
  CreateTournamentErrors,
  UpdateCreateTournamentDraftValue,
} from "../types"

type PricingStepProps = {
  draft: CreateTournamentDraft
  errors: CreateTournamentErrors
  onDraftChange: UpdateCreateTournamentDraftValue
}

function PricingStep({ draft, errors, onDraftChange }: PricingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscripción</CardTitle>
        <CardDescription>
          Define plazas disponibles y precio de inscripción.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Plazas disponibles"
          error={errors.max_participants}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={draft.max_participants}
              onChange={(event) =>
                onDraftChange("max_participants", event.target.value)
              }
              inputMode="numeric"
              disabled={draft.noMax}
            />
            <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.noMax}
                onChange={(event) => onDraftChange("noMax", event.target.checked)}
              />
              Sin límite
            </label>
          </div>
        </FormField>

        {!draft.has_categories && (
          <FormField label="Precio de inscripción" error={errors.entry_price}>
            <div className="relative">
              <Input
                value={draft.entry_price}
                onChange={(event) =>
                  onDraftChange("entry_price", event.target.value)
                }
                onBlur={() => {
                  if (!draft.entry_price.trim()) onDraftChange("entry_price", "0")
                }}
                inputMode="decimal"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </FormField>
        )}

        {draft.has_categories && (
          <Alert className="md:col-span-2">
            <AlertDescription>
              Cada categoría usa su propio precio. No hace falta definir un precio
              general para el torneo.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export { PricingStep }
