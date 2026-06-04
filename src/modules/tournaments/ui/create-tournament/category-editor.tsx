import { Edit3, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DateTimeField } from "@/components/ui/date-time-field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { FormField } from "./form-field"
import type {
  CreateTournamentCategoryDraft,
  CreateTournamentErrors,
  ParticipantType,
} from "./types"

type CategoryEditorProps = {
  category: CreateTournamentCategoryDraft
  categories: CreateTournamentCategoryDraft[]
  errors: CreateTournamentErrors
  editingCategoryId: string | null
  onCategoryChange: (
    patch: Partial<CreateTournamentCategoryDraft>
  ) => void
  onAddOrSave: () => void
  onEdit: (category: CreateTournamentCategoryDraft) => void
  onRemove: (categoryId: string) => void
  onCancelEdit: () => void
}

const participantTypeOptions: Array<{
  value: ParticipantType
  label: string
}> = [
  { value: "individual", label: "Individual" },
  { value: "team", label: "Equipos" },
]

function CategoryEditor({
  category,
  categories,
  errors,
  editingCategoryId,
  onCategoryChange,
  onAddOrSave,
  onEdit,
  onRemove,
  onCancelEdit,
}: CategoryEditorProps) {
  const isEditing = Boolean(editingCategoryId)

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Nombre de categoría" error={errors.name}>
            <Input
              value={category.name}
              onChange={(event) => onCategoryChange({ name: event.target.value })}
              placeholder="Femenino, Individual, Sub-16..."
            />
          </FormField>

          <FormField
            label="Tipo de participantes"
            error={errors.participant_type}
          >
            <Select
              value={category.participant_type ?? ""}
              onChange={(event) =>
                onCategoryChange({
                  participant_type:
                    event.target.value === "individual" ||
                    event.target.value === "team"
                      ? event.target.value
                      : null,
                })
              }
            >
              <option value="">Selecciona formato</option>
              {participantTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Precio de inscripción" error={errors.price}>
            <div className="relative">
              <Input
                value={category.price}
                onChange={(event) => onCategoryChange({ price: event.target.value })}
                onBlur={() => {
                  if (!category.price.trim()) onCategoryChange({ price: "0" })
                }}
                inputMode="decimal"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </FormField>

          <FormField
            label="Plazas disponibles"
            error={errors.max_participants}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={category.max_participants}
                onChange={(event) =>
                  onCategoryChange({ max_participants: event.target.value })
                }
                inputMode="numeric"
                disabled={category.noMax}
              />
              <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={category.noMax}
                  onChange={(event) =>
                    onCategoryChange({ noMax: event.target.checked })
                  }
                />
                Sin límite
              </label>
            </div>
          </FormField>

          <div className="space-y-3 lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex min-h-14 items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={category.hasCustomDate}
                  onChange={(event) =>
                    onCategoryChange({
                      hasCustomDate: event.target.checked,
                      start_at: event.target.checked ? category.start_at : "",
                    })
                  }
                  className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    Esta categoría tiene otra fecha distinta
                  </span>
                </span>
              </label>

              <label className="flex min-h-14 items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={category.hasCustomAddress}
                  onChange={(event) =>
                    onCategoryChange({
                      hasCustomAddress: event.target.checked,
                      address: event.target.checked ? category.address : "",
                    })
                  }
                  className="mt-1 size-4 shrink-0 rounded border-border accent-primary"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    Esta categoría tiene otra dirección distinta
                  </span>
                </span>
              </label>
            </div>

            {category.hasCustomDate && (
              <FormField label="Fecha de esta categoría">
                <DateTimeField
                  value={category.start_at}
                  onChange={(value) => onCategoryChange({ start_at: value })}
                  placeholder="Elige fecha y hora"
                />
              </FormField>
            )}

            {category.hasCustomAddress && (
              <FormField label="Dirección de esta categoría">
                <Input
                  value={category.address}
                  onChange={(event) =>
                    onCategoryChange({ address: event.target.value })
                  }
                />
              </FormField>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={onAddOrSave}>
            <Plus className="size-4" />
            {isEditing ? "Guardar categoría" : "Añadir categoría"}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancelar edición
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card className="border-dashed p-5 text-sm text-muted-foreground">
            Todavía no hay categorías añadidas.
          </Card>
        ) : (
          categories.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between",
                editingCategoryId === item.id && "border-primary"
              )}
            >
              <div className="min-w-0">
                <h3 className="truncate font-medium text-foreground">{item.name}</h3>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Editar categoría"
                  onClick={() => onEdit(item)}
                >
                  <Edit3 className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label="Eliminar categoría"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export { CategoryEditor }
