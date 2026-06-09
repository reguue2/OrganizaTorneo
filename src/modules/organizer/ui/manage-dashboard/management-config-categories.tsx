import { LockKeyhole, Plus, Trash2, UsersRound } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateTimeField } from "@/components/ui/date-time-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { RegistrationRow } from "@/modules/organizer/domain"
import type { TournamentBracketRow } from "@/modules/tournaments/domain"

import { isActiveRegistration } from "./display"
import type { ConfigCategoryForm, ConfigForm } from "./types"

export function ManagementConfigCategories({
  brackets,
  canEdit,
  form,
  registrations,
  setForm,
}: {
  brackets: TournamentBracketRow[]
  canEdit: boolean
  form: ConfigForm
  registrations: RegistrationRow[]
  setForm: React.Dispatch<React.SetStateAction<ConfigForm>>
}) {
  const canAddCategory = canEdit && brackets.length === 0

  const updateCategory = (
    key: string,
    patch: Partial<ConfigCategoryForm>
  ) => {
    setForm((previous) => ({
      ...previous,
      categories: previous.categories.map((category) =>
        category.key === key ? { ...category, ...patch } : category
      ),
    }))
  }

  const addCategory = () => {
    const key = crypto.randomUUID()
    setForm((previous) => ({
      ...previous,
      categories: [
        ...previous.categories,
        {
          key,
          id: null,
          name: "Nueva categoría",
          participant_type: "individual",
          price: "0",
          max_participants: "",
          no_max_participants: true,
          start_at: "",
          address: "",
          prizes: "",
        },
      ],
    }))
  }

  const removeCategory = (key: string) => {
    setForm((previous) => ({
      ...previous,
      categories: previous.categories.filter((category) => category.key !== key),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-medium text-foreground">Categorías</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Puedes ajustar nombres, horarios, ubicaciones, premios y plazas.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addCategory}
          disabled={!canAddCategory}
        >
          <Plus className="size-4" />
          Añadir categoría
        </Button>
      </div>

      {brackets.length > 0 && (
        <Alert variant="info">
          <AlertDescription>
            Ya existe un cuadro. Puedes editar las categorías actuales, pero no añadir
            nuevas ni eliminar categorías incluidas en cuadros.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {form.categories.map((category, index) => {
          const categoryRegistrations = category.id
            ? registrations.filter(
                (registration) => registration.category_id === category.id
              )
            : []
          const activeCount = categoryRegistrations.filter((registration) =>
            isActiveRegistration(registration.status)
          ).length
          const hasBracket = category.id
            ? brackets.some((bracket) => bracket.category_id === category.id)
            : false
          const registrationSettingsLocked = categoryRegistrations.length > 0
          const canRemove =
            canEdit &&
            form.categories.length > 1 &&
            categoryRegistrations.length === 0 &&
            !hasBracket

          return (
            <div
              key={category.key}
              className="rounded-xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {category.name.trim() || `Categoría ${index + 1}`}
                    </p>
                    {category.id ? (
                      <Badge variant="outline">{activeCount} activas</Badge>
                    ) : (
                      <Badge variant="info">Nueva</Badge>
                    )}
                    {registrationSettingsLocked && (
                      <Badge variant="warning">
                        <LockKeyhole className="mr-1 size-3" />
                        Precio y formato protegidos
                      </Badge>
                    )}
                  </div>
                  {categoryRegistrations.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tiene {categoryRegistrations.length} inscripciones históricas.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!canRemove}
                  onClick={() => removeCategory(category.key)}
                  title={
                    canRemove
                      ? "Quitar categoría al guardar"
                      : "Solo puedes quitar categorías sin inscripciones ni cuadro"
                  }
                >
                  <Trash2 className="size-4" />
                  Quitar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nombre">
                  <Input
                    value={category.name}
                    disabled={!canEdit}
                    onChange={(event) =>
                      updateCategory(category.key, { name: event.target.value })
                    }
                  />
                </Field>

                <Field label="Plazas disponibles">
                  <CapacityInput
                    capacity={category.max_participants}
                    disabled={!canEdit}
                    noMax={category.no_max_participants}
                    onCapacityChange={(value) =>
                      updateCategory(category.key, { max_participants: value })
                    }
                    onNoMaxChange={(checked) =>
                      updateCategory(category.key, {
                        no_max_participants: checked,
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mínimo permitido ahora: {activeCount}
                  </p>
                </Field>

                <Field label="Formato de inscripción">
                  <Select
                    value={category.participant_type}
                    disabled={!canEdit || registrationSettingsLocked}
                    onChange={(event) =>
                      updateCategory(category.key, {
                        participant_type: event.target.value as "individual" | "team",
                      })
                    }
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Equipos</option>
                  </Select>
                </Field>

                <Field label="Precio">
                  <MoneyInput
                    value={category.price}
                    disabled={!canEdit || registrationSettingsLocked}
                    onChange={(value) =>
                      updateCategory(category.key, { price: value })
                    }
                  />
                </Field>

                <Field label="Fecha propia de la categoría">
                  <DateTimeField
                    value={category.start_at}
                    disabled={!canEdit}
                    onChange={(value) =>
                      updateCategory(category.key, { start_at: value })
                    }
                    placeholder="Usar fecha general"
                  />
                </Field>

                <Field label="Ubicación propia de la categoría">
                  <Input
                    value={category.address}
                    disabled={!canEdit}
                    onChange={(event) =>
                      updateCategory(category.key, { address: event.target.value })
                    }
                    placeholder="Usar ubicación general"
                  />
                </Field>
              </div>

              {form.prize_mode === "per_category" && (
                <div className="mt-4">
                  <Field label="Premios de esta categoría">
                    <Textarea
                      value={category.prizes}
                      disabled={!canEdit}
                      className="min-h-24 resize-none"
                      onChange={(event) =>
                        updateCategory(category.key, { prizes: event.target.value })
                      }
                    />
                  </Field>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <UsersRound className="size-3.5" />
        Los precios y formatos se bloquean por categoría cuando reciben su primera
        inscripción.
      </p>
    </div>
  )
}

function CapacityInput({
  capacity,
  disabled,
  noMax,
  onCapacityChange,
  onNoMaxChange,
}: {
  capacity: string
  disabled: boolean
  noMax: boolean
  onCapacityChange: (value: string) => void
  onNoMaxChange: (checked: boolean) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <Input
        value={capacity}
        disabled={disabled || noMax}
        inputMode="numeric"
        onChange={(event) => onCapacityChange(event.target.value)}
      />
      <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={noMax}
          disabled={disabled}
          onChange={(event) => onNoMaxChange(event.target.checked)}
          className="size-4 accent-primary"
        />
        Sin límite
      </label>
    </div>
  )
}

function MoneyInput({
  disabled,
  onChange,
  value,
}: {
  disabled: boolean
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div className="relative">
      <Input
        value={value}
        disabled={disabled}
        inputMode="decimal"
        className="pr-8"
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        €
      </span>
    </div>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export { CapacityInput, Field, MoneyInput }
