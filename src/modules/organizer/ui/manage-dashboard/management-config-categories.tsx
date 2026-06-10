import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DateTimeField } from "@/components/ui/date-time-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { RegistrationRow } from "@/modules/organizer/domain"
import type { TournamentBracketRow } from "@/modules/tournaments/domain"

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
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => new Set())

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
    setOpenCategories((previous) => new Set(previous).add(key))
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
    setOpenCategories((previous) => {
      const next = new Set(previous)
      next.delete(key)
      return next
    })
    setForm((previous) => ({
      ...previous,
      categories: previous.categories.filter((category) => category.key !== key),
    }))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="font-medium text-foreground">Categorías</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addCategory}
          disabled={!canEdit}
        >
          <Plus className="size-4" />
          Añadir categoría
        </Button>
      </div>

      <div className="space-y-4">
        {form.categories.map((category, index) => {
          const categoryRegistrations = category.id
            ? registrations.filter(
                (registration) => registration.category_id === category.id
              )
            : []
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
            <details
              key={category.key}
              open={openCategories.has(category.key)}
              onToggle={(event) => {
                const isOpen = event.currentTarget.open
                setOpenCategories((previous) => {
                  const next = new Set(previous)
                  if (isOpen) next.add(category.key)
                  else next.delete(category.key)
                  return next
                })
              }}
              className="group rounded-xl border border-border bg-card shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate font-medium text-foreground">
                  {category.name.trim() || `Categoría ${index + 1}`}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>

              <div className="border-t border-border p-4">
                <div className="mb-4 flex justify-end">
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
            </details>
          )
        })}
      </div>
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
