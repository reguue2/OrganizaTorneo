import { useMemo, useState, type FormEvent } from "react"

import { getSpanishPhoneValidationMessage } from "@/modules/registrations/domain"

import {
  getInitialPaymentMethod,
  isValidEmail,
  mapErrorMessage,
} from "./display"
import type {
  ErrorPayload,
  OnlineCheckoutResult,
  ParticipantType,
  RegisterFormProps,
  RegistrationFormFieldErrors,
  RegistrationPaymentMethod,
  RegistrationRequestResult,
  RegistrationVerificationResult,
} from "./types"

type ValidationResult = {
  fieldErrors: RegistrationFormFieldErrors
  formError: string | null
}

function useRegisterForm({
  categories,
  entryPrice,
  hasCategories,
  onCategoryChange,
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
  const [fieldErrors, setFieldErrors] = useState<RegistrationFormFieldErrors>({})
  const [requestResult, setRequestResult] =
    useState<RegistrationRequestResult | null>(null)
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null)
  const [pendingRequestExpiresAt, setPendingRequestExpiresAt] =
    useState<string | null>(null)
  const [resendFeedback, setResendFeedback] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] =
    useState<RegistrationVerificationResult | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationModalOpen, setVerificationModalOpen] = useState(false)

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

  const validate = (): ValidationResult => {
    const nextFieldErrors: RegistrationFormFieldErrors = {}

    if (hasCategories && !categoryId) {
      nextFieldErrors.categoryId = "Debes seleccionar una categoría."
    }

    if (!effectiveParticipantType) {
      if (hasCategories) {
        nextFieldErrors.categoryId =
          "Tienes que seleccionar una categoría."
        return { fieldErrors: nextFieldErrors, formError: null }
      }

      return {
        fieldErrors: nextFieldErrors,
        formError:
          "El organizador todavía no ha configurado el formato de inscripción de este torneo.",
      }
    }

    if (!displayName.trim()) {
      nextFieldErrors.displayName = effectiveParticipantType === "team"
        ? "El nombre del equipo es obligatorio."
        : "El nombre del participante es obligatorio."
    }

    const phoneError = getSpanishPhoneValidationMessage(contactPhone)
    if (phoneError) {
      nextFieldErrors.contactPhone = phoneError
    }

    if (!contactEmail.trim()) {
      nextFieldErrors.contactEmail =
        "El email de contacto es obligatorio."
    } else if (!isValidEmail(contactEmail.trim())) {
      nextFieldErrors.contactEmail = "Introduce un email válido."
    }

    return { fieldErrors: nextFieldErrors, formError: null }
  }

  const resetState = () => {
    setError(null)
    setFieldErrors({})
    setPendingRequestId(null)
    setPendingRequestExpiresAt(null)
    setResendFeedback(null)
  }

  const clearFieldError = (field: keyof RegistrationFormFieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const updateCategoryId = (value: string) => {
    setCategoryId(value)
    onCategoryChange?.(value)
    clearFieldError("categoryId")
    setError(null)
  }

  const updateDisplayName = (value: string) => {
    setDisplayName(value)
    clearFieldError("displayName")
    setError(null)
  }

  const updateContactPhone = (value: string) => {
    setContactPhone(value)
    clearFieldError("contactPhone")
    setError(null)
  }

  const updateContactEmail = (value: string) => {
    setContactEmail(value)
    clearFieldError("contactEmail")
    setError(null)
  }

  const resetForm = () => {
    setRequestResult(null)
    setDisplayName("")
    setContactPhone("")
    setContactEmail("")
    setSelectedPaymentMethod(getInitialPaymentMethod(paymentMethod))
    setVerificationCode("")
    setVerificationError(null)
    setVerificationResult(null)
    setVerificationModalOpen(false)
    resetState()
  }

  const handleResend = async (
    requestId = pendingRequestId ?? requestResult?.request_id ?? null
  ) => {
    if (!requestId) return

    setResending(true)
    setError(null)
    setFieldErrors({})
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
      if (result.email_delivery_status === "sent") {
        setVerificationError(null)
        setVerificationModalOpen(true)
      } else {
        setError(result.email_delivery_message)
      }
    } catch {
      setError("No se pudo reenviar la verificación.")
    } finally {
      setResending(false)
    }
  }

  const verifyCode = async () => {
    if (!requestResult || verificationCode.length !== 6) return

    setVerifying(true)
    setVerificationError(null)

    try {
      const response = await fetch("/api/public-registration-verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestResult.request_id,
          verificationCode,
        }),
      })
      const payload = (await response.json()) as
        | RegistrationVerificationResult
        | ErrorPayload

      if (!response.ok) {
        const errorPayload = payload as ErrorPayload
        setVerificationError(
          mapErrorMessage(
            errorPayload.error ?? "No se pudo validar el código.",
            errorPayload.code
          )
        )
        return
      }

      setVerificationResult(payload as RegistrationVerificationResult)
    } catch {
      setVerificationError("No se pudo validar el código.")
    } finally {
      setVerifying(false)
    }
  }

  const closeVerificationModal = () => {
    if (verifying) return

    if (verificationResult) {
      resetForm()
      return
    }

    setVerificationModalOpen(false)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetState()

    const validationResult = validate()
    if (
      validationResult.formError ||
      Object.keys(validationResult.fieldErrors).length > 0
    ) {
      setError(validationResult.formError)
      setFieldErrors(validationResult.fieldErrors)
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
        | OnlineCheckoutResult
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

      if (selectedPaymentMethod === "online") {
        const checkoutResult = payload as OnlineCheckoutResult
        if (!checkoutResult.checkout_url) {
          setError("Stripe no devolvió una URL para completar el pago.")
          return
        }

        window.location.assign(checkoutResult.checkout_url)
        return
      }

      const result = payload as RegistrationRequestResult
      setPendingRequestId(result.request_id)
      setPendingRequestExpiresAt(result.expires_at)
      if (result.email_delivery_status !== "sent") {
        setError(result.email_delivery_message)
        return
      }

      setRequestResult(result)
      setVerificationCode("")
      setVerificationError(null)
      setVerificationResult(null)
      setVerificationModalOpen(true)
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
    fieldErrors,
    pendingRequestExpiresAt,
    pendingRequestId,
    requestResult,
    resendFeedback,
    resending,
    selectedCategory,
    selectedPaymentMethod,
    setCategoryId: updateCategoryId,
    setContactEmail: updateContactEmail,
    setContactPhone: updateContactPhone,
    setDisplayName: updateDisplayName,
    setSelectedPaymentMethod,
    submit,
    submitting,
    handleResend,
    closeVerificationModal,
    resetForm,
    verificationCode,
    verificationError,
    verificationModalOpen,
    verificationResult,
    verifying,
    setVerificationCode,
    verifyCode,
  }
}

export { useRegisterForm }
