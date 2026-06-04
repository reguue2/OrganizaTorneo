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
        <CardTitle>Cupos y precio</CardTitle>
        <CardDescription>
          Define límites y precio base cuando no hay categorías.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Mínimo de inscripciones"
          error={errors.min_participants}
        >
          <Input
            value={draft.min_participants}
            onChange={(event) =>
              onDraftChange("min_participants", event.target.value)
            }
            inputMode="numeric"
          />
        </FormField>

        <FormField
          label="Máximo de inscripciones"
          error={errors.max_participants}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={draft.max_participants}
              onChange={(event) =>
                onDraftChange("max_participants", event.target.value)
              }
              inputMode="numeric"
              placeholder="Sin máximo"
              disabled={draft.noMax}
            />
            <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.noMax}
                onChange={(event) => onDraftChange("noMax", event.target.checked)}
              />
              Sin máximo
            </label>
          </div>
        </FormField>

        {!draft.has_categories && (
          <FormField label="Precio" error={errors.entry_price}>
            <Input
              value={draft.entry_price}
              onChange={(event) =>
                onDraftChange("entry_price", event.target.value)
              }
              inputMode="decimal"
              placeholder="0"
            />
          </FormField>
        )}

        {draft.has_categories && (
          <Alert className="md:col-span-2">
            <AlertDescription>
              El precio se toma de cada categoría. El precio global se enviará como 0.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export { PricingStep }
