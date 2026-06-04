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
import { DateTimeField } from "@/components/ui/date-time-field"
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
        <CardDescription>
          Nombre, ubicación y fechas que verá el participante.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <FormField label="Nombre del torneo" error={errors.title}>
          <Input
            value={draft.title}
            onChange={(event) => onDraftChange("title", event.target.value)}
          />
        </FormField>

        <FormField label="Descripción para participantes">
          <Textarea
            value={draft.description}
            onChange={(event) => onDraftChange("description", event.target.value)}
            className="resize-none"
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
            />
          </FormField>

          <FormField label="Fecha del torneo" error={errors.date}>
            <DateTimeField
              value={draft.date}
              onChange={(value) => onDraftChange("date", value)}
              placeholder="Elige fecha y hora"
            />
          </FormField>

          <FormField
            label="Cierre de inscripción"
            error={errors.registration_deadline}
          >
            <DateTimeField
              value={draft.registration_deadline}
              onChange={(value) => onDraftChange("registration_deadline", value)}
              placeholder="Elige cierre"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>
  )
}

export { BasicsStep }
