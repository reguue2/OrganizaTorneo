import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SPAIN_COMMUNITIES } from "@/shared/locations"

import { FormField } from "../form-field"
import type {
  CreateTournamentDraft,
  CreateTournamentErrors,
  UpdateCreateTournamentDraftValue,
} from "../types"

type BasicsStepProps = {
  draft: CreateTournamentDraft
  errors: CreateTournamentErrors
  onDraftChange: UpdateCreateTournamentDraftValue
}

function BasicsStep({ draft, errors, onDraftChange }: BasicsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información básica</CardTitle>
        <CardDescription>Datos públicos principales del torneo.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField label="Título" error={errors.title}>
          <Input
            value={draft.title}
            onChange={(event) => onDraftChange("title", event.target.value)}
            placeholder="Torneo local de verano"
          />
        </FormField>

        <FormField label="Descripción">
          <Textarea
            value={draft.description}
            onChange={(event) => onDraftChange("description", event.target.value)}
            placeholder="Información útil para participantes"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Provincia" error={errors.province}>
            <Select
              value={draft.province}
              onChange={(event) => onDraftChange("province", event.target.value)}
            >
              <option value="">Selecciona provincia</option>
              {SPAIN_COMMUNITIES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Dirección" error={errors.address}>
            <Input
              value={draft.address}
              onChange={(event) => onDraftChange("address", event.target.value)}
              placeholder="Polideportivo, plaza, pista..."
            />
          </FormField>

          <FormField label="Fecha del torneo" error={errors.date}>
            <Input
              type="datetime-local"
              value={draft.date}
              onChange={(event) => onDraftChange("date", event.target.value)}
            />
          </FormField>

          <FormField
            label="Cierre de inscripción"
            error={errors.registration_deadline}
          >
            <Input
              type="datetime-local"
              value={draft.registration_deadline}
              onChange={(event) =>
                onDraftChange("registration_deadline", event.target.value)
              }
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  )
}

export { BasicsStep }
