"use client"

import {
  CalendarDays,
  Shield,
  Trophy,
  Users,
} from "lucide-react"
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"

import {
  createTournament,
  type CreateTournamentActionState,
} from "@/modules/tournaments/server/create-tournament-action"

import { getParticipantTypeLabel, getPaymentLabel } from "./display"
import {
  CREATE_TOURNAMENT_STEPS,
  INITIAL_CREATE_TOURNAMENT_DRAFT,
  createEmptyCategoryDraft,
  formatPreviewDate,
  formatPreviewMoney,
  parseStoredCreateTournamentDraft,
  serializeCreateTournamentDraft,
  validateCategoryDraft,
  validateStep,
} from "./form-state"
import type {
  CreateTournamentCategoryDraft,
  CreateTournamentDraft,
  CreateTournamentErrors,
  CreateTournamentPreviewItem,
  CreateTournamentStepId,
} from "./types"

const STORAGE_KEY = "create-tournament-form-v2"

const initialActionState: CreateTournamentActionState = {
  error: null,
}

function getStepIndex(step: CreateTournamentStepId) {
  return CREATE_TOURNAMENT_STEPS.findIndex((item) => item.id === step)
}

function getFirstInvalidStep(
  draft: CreateTournamentDraft
): CreateTournamentStepId | null {
  for (const step of CREATE_TOURNAMENT_STEPS) {
    const errors = validateStep(step.id, draft)
    if (Object.keys(errors).length > 0) return step.id
  }

  return null
}

function buildPreviewItems(
  draft: CreateTournamentDraft
): CreateTournamentPreviewItem[] {
  return [
    { label: "Fecha", value: formatPreviewDate(draft.date), icon: CalendarDays },
    {
      label: "Formato",
      value: draft.has_categories
        ? `${draft.categories.length} categorías`
        : getParticipantTypeLabel(draft.participant_type),
      icon: Users,
    },
    {
      label: "Precio",
      value: draft.has_categories
        ? "Por categoría"
        : formatPreviewMoney(draft.entry_price),
      icon: Trophy,
    },
    { label: "Pago", value: getPaymentLabel(draft.payment_method), icon: Shield },
  ]
}

function useCreateTournamentForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [serverState, formAction, pending] = useActionState(
    createTournament,
    initialActionState
  )
  const [draft, setDraft] = useState<CreateTournamentDraft>(
    INITIAL_CREATE_TOURNAMENT_DRAFT
  )
  const [step, setStep] = useState<CreateTournamentStepId>("basics")
  const [errors, setErrors] = useState<CreateTournamentErrors>({})
  const [categoryErrors, setCategoryErrors] = useState<CreateTournamentErrors>({})
  const [categoryDraft, setCategoryDraft] =
    useState<CreateTournamentCategoryDraft>(createEmptyCategoryDraft)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [posterName, setPosterName] = useState("")
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const currentStepIndex = getStepIndex(step)
  const previewItems = useMemo(() => buildPreviewItems(draft), [draft])

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return

      const stored = parseStoredCreateTournamentDraft(
        sessionStorage.getItem(STORAGE_KEY)
      )

      setDraft(stored ?? INITIAL_CREATE_TOURNAMENT_DRAFT)
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    sessionStorage.setItem(STORAGE_KEY, serializeCreateTournamentDraft(draft))
  }, [draft, loaded])

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview)
    }
  }, [posterPreview])

  const setDraftValue = <Key extends keyof CreateTournamentDraft>(
    key: Key,
    value: CreateTournamentDraft[Key]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const changePoster = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setPosterName(file?.name ?? "")
    setErrors((current) => {
      const next = { ...current }
      delete next.poster
      return next
    })

    setPosterPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview)
      return file ? URL.createObjectURL(file) : null
    })
  }

  const resetCategoryEditor = () => {
    setCategoryDraft(createEmptyCategoryDraft())
    setEditingCategoryId(null)
    setCategoryErrors({})
  }

  const addOrSaveCategory = () => {
    const nextErrors = validateCategoryDraft(categoryDraft)
    setCategoryErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setDraft((current) => {
      const normalizedCategory = {
        ...categoryDraft,
        name: categoryDraft.name.trim(),
      }

      if (!editingCategoryId) {
        return {
          ...current,
          categories: [...current.categories, normalizedCategory],
        }
      }

      return {
        ...current,
        categories: current.categories.map((category) =>
          category.id === editingCategoryId ? normalizedCategory : category
        ),
      }
    })

    setErrors((current) => {
      const next = { ...current }
      delete next.categories
      return next
    })
    resetCategoryEditor()
  }

  const removeCategory = (categoryId: string) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== categoryId),
    }))

    if (editingCategoryId === categoryId) {
      resetCategoryEditor()
    }
  }

  const editCategory = (category: CreateTournamentCategoryDraft) => {
    setCategoryDraft(category)
    setEditingCategoryId(category.id)
    setCategoryErrors({})
  }

  const goToStep = (nextStep: CreateTournamentStepId) => {
    setStep(nextStep)
    setErrors({})
  }

  const goNext = () => {
    const stepErrors = validateStep(step, draft)
    setErrors(stepErrors)

    if (Object.keys(stepErrors).length > 0) return

    const nextStep = CREATE_TOURNAMENT_STEPS[currentStepIndex + 1]?.id
    if (nextStep) goToStep(nextStep)
  }

  const goBack = () => {
    const previousStep = CREATE_TOURNAMENT_STEPS[currentStepIndex - 1]?.id
    if (previousStep) goToStep(previousStep)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    const invalidStep = getFirstInvalidStep(draft)

    if (!invalidStep) return

    event.preventDefault()
    setStep(invalidStep)
    setErrors(validateStep(invalidStep, draft))
  }

  return {
    addOrSaveCategory,
    canGoBack: currentStepIndex > 0,
    categoryDraft,
    categoryErrors,
    changePoster,
    currentStepIndex,
    currentStepNumber: currentStepIndex + 1,
    draft,
    editCategory,
    editingCategoryId,
    errors,
    fileInputRef,
    formAction,
    goBack,
    goNext,
    goToStep,
    isLastStep: currentStepIndex === CREATE_TOURNAMENT_STEPS.length - 1,
    loaded,
    pending,
    posterName,
    posterPreview,
    previewItems,
    removeCategory,
    resetCategoryEditor,
    serverState,
    setCategoryDraft,
    setDraftValue,
    step,
    submit,
  }
}

export { useCreateTournamentForm }
