import { Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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

import { CategoryEditor } from "../category-editor"
import { FormField } from "../form-field"
import type {
  CreateTournamentCategoryDraft,
  CreateTournamentDraft,
  CreateTournamentErrors,
  UpdateCreateTournamentDraftValue,
} from "../types"

type StructureStepProps = {
  categoryDraft: CreateTournamentCategoryDraft
  categoryErrors: CreateTournamentErrors
  draft: CreateTournamentDraft
  editingCategoryId: string | null
  errors: CreateTournamentErrors
  onAddOrSaveCategory: () => void
  onCancelCategoryEdit: () => void
  onCategoryDraftChange: (
    patch: Partial<CreateTournamentCategoryDraft>
  ) => void
  onDraftChange: UpdateCreateTournamentDraftValue
  onEditCategory: (category: CreateTournamentCategoryDraft) => void
  onRemoveCategory: (categoryId: string) => void
}

function StructureStep({
  categoryDraft,
  categoryErrors,
  draft,
  editingCategoryId,
  errors,
  onAddOrSaveCategory,
  onCancelCategoryEdit,
  onCategoryDraftChange,
  onDraftChange,
  onEditCategory,
  onRemoveCategory,
}: StructureStepProps) {
  const categoryWarningRef = useRef<HTMLDivElement | null>(null)
  const [showCategoryWarning, setShowCategoryWarning] = useState(false)

  useEffect(() => {
    if (!errors.categories) {
      return
    }

    const showTimer = window.setTimeout(() => {
      setShowCategoryWarning(true)
    }, 0)

    const focusTimer = window.setTimeout(() => {
      categoryWarningRef.current?.focus()
      categoryWarningRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      })
    }, 50)

    const hideTimer = window.setTimeout(() => {
      setShowCategoryWarning(false)
    }, 3500)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(focusTimer)
      window.clearTimeout(hideTimer)
    }
  }, [errors])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>
          Decide si el torneo es con categorías o no.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant={!draft.has_categories ? "default" : "outline"}
            className="h-auto justify-start p-4"
            onClick={() => onDraftChange("has_categories", false)}
          >
            <Users className="size-4" />
            Sin categorías
          </Button>
          <Button
            type="button"
            variant={draft.has_categories ? "default" : "outline"}
            className="h-auto justify-start p-4"
            onClick={() => onDraftChange("has_categories", true)}
          >
            <Users className="size-4" />
            Con categorías
          </Button>
        </div>

        {draft.has_categories ? (
          <>
            {showCategoryWarning && errors.categories && (
              <Alert ref={categoryWarningRef} tabIndex={-1} variant="warning">
                <AlertDescription>{errors.categories}</AlertDescription>
              </Alert>
            )}

            <CategoryEditor
              category={categoryDraft}
              categories={draft.categories}
              errors={categoryErrors}
              editingCategoryId={editingCategoryId}
              onCategoryChange={onCategoryDraftChange}
              onAddOrSave={onAddOrSaveCategory}
              onEdit={onEditCategory}
              onRemove={onRemoveCategory}
              onCancelEdit={onCancelCategoryEdit}
            />
          </>
        ) : (
          <FormField
            label="Tipo de participantes"
            error={errors.participant_type}
          >
            <Select
              value={draft.participant_type ?? ""}
              onChange={(event) =>
                onDraftChange(
                  "participant_type",
                  event.target.value === "individual" ||
                    event.target.value === "team"
                    ? event.target.value
                    : null
                )
              }
            >
              <option value="">Selecciona formato</option>
              <option value="individual">Individual</option>
              <option value="team">Equipos</option>
            </Select>
          </FormField>
        )}
      </CardContent>
    </Card>
  )
}

export { StructureStep }
