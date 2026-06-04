import { Edit3, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { FormField } from "./form-field"
import { formatPreviewMoney } from "./form-state"
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
  prizeMode: "none" | "global" | "per_category"
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
  prizeMode,
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
              placeholder="Senior, mixto, sub-16..."
            />
          </FormField>

          <FormField
            label="Formato"
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

          <FormField label="Precio" error={errors.price}>
            <Input
              value={category.price}
              onChange={(event) => onCategoryChange({ price: event.target.value })}
              inputMode="decimal"
              placeholder="0"
            />
          </FormField>

          <FormField label="Mínimo de inscripciones" error={errors.min_participants}>
            <Input
              value={category.min_participants}
              onChange={(event) =>
                onCategoryChange({ min_participants: event.target.value })
              }
              inputMode="numeric"
              placeholder="1"
            />
          </FormField>

          <FormField
            label="Máximo de inscripciones"
            error={errors.max_participants}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={category.max_participants}
                onChange={(event) =>
                  onCategoryChange({ max_participants: event.target.value })
                }
                inputMode="numeric"
                placeholder="Sin máximo"
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
                Sin máximo
              </label>
            </div>
          </FormField>

          <FormField label="Fecha propia">
            <Input
              type="datetime-local"
              value={category.start_at}
              onChange={(event) =>
                onCategoryChange({ start_at: event.target.value })
              }
            />
          </FormField>

          <FormField label="Dirección propia" className="lg:col-span-2">
            <Input
              value={category.address}
              onChange={(event) =>
                onCategoryChange({ address: event.target.value })
              }
              placeholder="Solo si cambia respecto al torneo"
            />
          </FormField>

          {prizeMode === "per_category" && (
            <FormField label="Premios de esta categoría" className="lg:col-span-2">
              <Textarea
                value={category.prizes}
                onChange={(event) =>
                  onCategoryChange({ prizes: event.target.value })
                }
                placeholder="Premios o reconocimientos"
              />
            </FormField>
          )}
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
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  <Badge variant="outline">
                    {item.participant_type === "team" ? "Equipos" : "Individual"}
                  </Badge>
                  <Badge variant="secondary">{formatPreviewMoney(item.price)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mín. {item.min_participants || "1"}
                  {item.noMax ? " · sin máximo" : ` · máx. ${item.max_participants}`}
                </p>
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
