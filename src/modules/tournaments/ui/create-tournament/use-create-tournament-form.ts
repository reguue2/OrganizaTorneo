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
const SUBMITTED_STORAGE_KEY = "create-tournament-form-v2-submitted"
const MAX_POSTER_SIZE = 5 * 1024 * 1024

export type CreateTournamentProfileContact = {
  name: string
  whatsapp: string
  contactEmail: string
}

const initialActionState: CreateTournamentActionState = {
  error: null,
}

function getStepIndex(step: CreateTournamentStepId) {
  return CREATE_TOURNAMENT_STEPS.findIndex((item) => item.id === step)
}

function getFirstInvalidStep(
  draft: CreateTournamentDraft
): CreateTournamentStepId | null {
  for (const step of getFlowSteps(draft)) {
    const errors = validateStep(step.id, draft)
    if (Object.keys(errors).length > 0) return step.id
  }

  return null
}

function getFlowSteps(draft: CreateTournamentDraft) {
  if (!draft.has_categories) return CREATE_TOURNAMENT_STEPS

  return CREATE_TOURNAMENT_STEPS.filter((item) => item.id !== "pricing")
}

function buildPreviewItems(
  draft: CreateTournamentDraft
): CreateTournamentPreviewItem[] {
  return [
    { label: "Fecha", value: formatPreviewDate(draft.date), icon: CalendarDays },
    {
      label: draft.has_categories ? "Categorías" : "Inscripción",
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

function useCreateTournamentForm(profileContact: CreateTournamentProfileContact) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const {
    name: prefillName,
    whatsapp: prefillWhatsapp,
    contactEmail: prefillContactEmail,
  } = profileContact
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

      const wasSubmitted = sessionStorage.getItem(SUBMITTED_STORAGE_KEY) === "true"

      if (wasSubmitted) {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(SUBMITTED_STORAGE_KEY)
      }

      const stored = wasSubmitted
        ? null
        : parseStoredCreateTournamentDraft(sessionStorage.getItem(STORAGE_KEY))

      // Prefill the contact from the organizer profile when the draft has none,
      // so it is set once and reused across tournaments.
      const base = stored ?? INITIAL_CREATE_TOURNAMENT_DRAFT
      setDraft({
        ...base,
        contact_name: base.contact_name || prefillName,
        contact_whatsapp: base.contact_whatsapp || prefillWhatsapp,
        contact_email: base.contact_email || prefillContactEmail,
      })
      setLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [prefillName, prefillWhatsapp, prefillContactEmail])

  useEffect(() => {
    if (!loaded) return
    sessionStorage.setItem(STORAGE_KEY, serializeCreateTournamentDraft(draft))
  }, [draft, loaded])

  useEffect(() => {
    if (!serverState.error) return
    sessionStorage.removeItem(SUBMITTED_STORAGE_KEY)
  }, [serverState.error])

  useEffect(() => {
    return () => {
      if (posterPreview) URL.revokeObjectURL(posterPreview)
    }
  }, [posterPreview])

  const setDraftValue = <Key extends keyof CreateTournamentDraft>(
    key: Key,
    value: CreateTournamentDraft[Key]
  ) => {
    setDraft((current) => {
      const next = { ...current, [key]: value }

      if (key === "has_categories" && value === false && next.prize_mode === "per_category") {
        next.prize_mode = "none"
      }

      return next
    })
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const setPosterFile = (file: File | null) => {
    if (file && !file.type.startsWith("image/")) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      setPosterName("")
      setPosterPreview((currentPreview) => {
        if (currentPreview) URL.revokeObjectURL(currentPreview)
        return null
      })
      setErrors((current) => ({
        ...current,
        poster: "El cartel debe ser una imagen válida.",
      }))
      return
    }

    if (file && file.size > MAX_POSTER_SIZE) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      setPosterName("")
      setPosterPreview((currentPreview) => {
        if (currentPreview) URL.revokeObjectURL(currentPreview)
        return null
      })
      setErrors((current) => ({
        ...current,
        poster: "El cartel no puede superar los 5MB.",
      }))
      return
    }

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

  const changePoster = (event: ChangeEvent<HTMLInputElement>) => {
    setPosterFile(event.target.files?.[0] ?? null)
  }

  const dropPoster = (file: File) => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files
    }

    setPosterFile(file)
  }

  const clearPoster = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setPosterFile(null)
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

    const flowSteps = getFlowSteps(draft)
    const flowStepIndex = flowSteps.findIndex((item) => item.id === step)
    const nextStep = flowSteps[flowStepIndex + 1]?.id
    if (nextStep) goToStep(nextStep)
  }

  const goBack = () => {
    const flowSteps = getFlowSteps(draft)
    const flowStepIndex = flowSteps.findIndex((item) => item.id === step)
    const previousStep = flowSteps[flowStepIndex - 1]?.id
    if (previousStep) goToStep(previousStep)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    const invalidStep = getFirstInvalidStep(draft)

    if (!invalidStep) {
      sessionStorage.setItem(SUBMITTED_STORAGE_KEY, "true")
      return
    }

    event.preventDefault()
    setStep(invalidStep)
    setErrors(validateStep(invalidStep, draft))
  }

  return {
    addOrSaveCategory,
    canGoBack: getFlowSteps(draft).findIndex((item) => item.id === step) > 0,
    categoryDraft,
    categoryErrors,
    changePoster,
    clearPoster,
    currentStepIndex,
    draft,
    editCategory,
    editingCategoryId,
    errors,
    fileInputRef,
    formAction,
    goBack,
    goNext,
    goToStep,
    isLastStep: step === getFlowSteps(draft).at(-1)?.id,
    loaded,
    pending,
    posterName,
    posterPreview,
    previewItems,
    dropPoster,
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
