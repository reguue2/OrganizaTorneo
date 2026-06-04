import { useMemo, useState, type FormEvent } from "react"

import { getSpanishPhoneValidationMessage } from "@/modules/registrations/domain"

import {
  getInitialPaymentMethod,
  isValidEmail,
  mapErrorMessage,
} from "./display"
import type {
  ErrorPayload,
  ParticipantType,
  RegisterFormProps,
  RegistrationPaymentMethod,
  RegistrationRequestResult,
} from "./types"

function useRegisterForm({
  categories,
  entryPrice,
  hasCategories,
  paymentMethod,
  tournamentId,
  tournamentParticipantType,
}: RegisterFormProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<RegistrationPaymentMethod>(getInitialPaymentMethod(paymentMethod))
  const [categoryId, setCategoryId] = useState<string>(
    hasCategories && categories.length === 1 ? categories[0].id : ""
  )
  const [displayName, setDisplayName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestResult, setRequestResult] =
    useState<RegistrationRequestResult | null>(null)
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [pendingRequestExpiresAt, setPendingRequestExpiresAt] =
    useState<string | null>(null)
  const [resendFeedback, setResendFeedback] = useState<string | null>(null)

  const selectedCategory = useMemo(() => {
    if (!hasCategories) return null
    return categories.find((category) => category.id === categoryId) ?? null
  }, [hasCategories, categories, categoryId])

  const effectiveParticipantType = useMemo<ParticipantType | null>(() => {
    if (hasCategories) {
      return selectedCategory?.participant_type ?? null
    }

    return tournamentParticipantType
  }, [hasCategories, selectedCategory, tournamentParticipantType])

  const amount = useMemo(() => {
    if (hasCategories) {
      return selectedCategory ? Number(selectedCategory.price) : null
    }
    return Number(entryPrice)
  }, [hasCategories, selectedCategory, entryPrice])

  const validate = () => {
    if (hasCategories && !categoryId) {
      return "Debes seleccionar una categoría."
    }

    if (!effectiveParticipantType) {
      return hasCategories
        ? "La categoría seleccionada todavía no tiene configurado el formato de inscripción."
        : "El organizador todavía no ha configurado el formato de inscripción de este torneo."
    }

    if (!displayName.trim()) {
      return effectiveParticipantType === "team"
        ? "El nombre del equipo es obligatorio."
        : "El nombre del participante es obligatorio."
    }

    const phoneError = getSpanishPhoneValidationMessage(contactPhone)
    if (phoneError) return phoneError

    if (!contactEmail.trim()) {
      return "El email de contacto es obligatorio para validar la inscripción."
    }

    if (!isValidEmail(contactEmail.trim())) {
      return "Introduce un email válido."
    }

    return null
  }

  const resetState = () => {
    setError(null)
    setPendingRequestId(null)
    setPendingRequestExpiresAt(null)
    setResendFeedback(null)
  }

  const resetForm = () => {
    setRequestResult(null)
    setDisplayName("")
    setContactPhone("")
    setContactEmail("")
    setSelectedPaymentMethod(getInitialPaymentMethod(paymentMethod))
    resetState()
  }

  const handleResend = async (
    requestId = pendingRequestId ?? requestResult?.request_id ?? null
  ) => {
    if (!requestId) return

    setResending(true)
    setError(null)
    setResendFeedback(null)

    try {
      const response = await fetch("/api/public-registration-requests/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      })

      const payload = (await response.json()) as
        | RegistrationRequestResult
        | ErrorPayload

      if (!response.ok) {
        const errorPayload = payload as ErrorPayload
        const retryAfter =
          typeof errorPayload.retry_after_seconds === "number"
            ? errorPayload.retry_after_seconds
            : null
        const mapped = mapErrorMessage(
          errorPayload.error ?? "No se pudo reenviar la verificación.",
          errorPayload.code
        )

        setError(
          retryAfter !== null
            ? `${mapped} Vuelve a intentarlo en ${retryAfter} segundos.`
            : mapped
        )
        return
      }

      const result = payload as RegistrationRequestResult
      setRequestResult(result)
      setPendingRequestId(result.request_id)
      setPendingRequestExpiresAt(result.expires_at)
      setResendFeedback(
        result.email_delivery_status === "sent"
          ? "Te hemos reenviado el correo de verificación."
          : result.email_delivery_message
      )
    } catch {
      setError("No se pudo reenviar la verificación.")
    } finally {
      setResending(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetState()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/public-registration-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tournamentId,
          categoryId: hasCategories ? categoryId || null : null,
          displayName: displayName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          paymentMethod: selectedPaymentMethod,
        }),
      })

      const payload = (await response.json()) as
        | RegistrationRequestResult
        | ErrorPayload

      if (!response.ok) {
        const errorPayload = payload as ErrorPayload

        setError(
          mapErrorMessage(
            errorPayload.error ?? "No se pudo crear la solicitud.",
            errorPayload.code
          )
        )
        setPendingRequestId(errorPayload.pending_request_id ?? null)
        setPendingRequestExpiresAt(errorPayload.expires_at ?? null)
        return
      }

      const result = payload as RegistrationRequestResult
      setRequestResult(result)
      setPendingRequestId(result.request_id)
      setPendingRequestExpiresAt(result.expires_at)
    } catch {
      setError("No se pudo crear la solicitud de inscripción.")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    amount,
    categoryId,
    contactEmail,
    contactPhone,
    displayName,
    effectiveParticipantType,
    error,
    pendingRequestExpiresAt,
    pendingRequestId,
    requestResult,
    resendFeedback,
    resending,
    selectedCategory,
    selectedPaymentMethod,
    setCategoryId,
    setContactEmail,
    setContactPhone,
    setDisplayName,
    setSelectedPaymentMethod,
    submit,
    submitting,
    handleResend,
    resetForm,
  }
}

export { useRegisterForm }
