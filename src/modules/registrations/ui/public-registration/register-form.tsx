"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import { formatDateTime } from "./display"
import {
  AmountSummary,
  CategoryField,
  ParticipantContactFields,
  PaymentMethodField,
  PendingRequestAlert,
} from "./form-sections"
import { RegistrationCreatedPanel } from "./registration-created-panel"
import type { RegisterFormProps } from "./types"
import { useRegisterForm } from "./use-register-form"

export default function RegisterForm(props: RegisterFormProps) {
  const {
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
    setCategoryId,
    setContactEmail,
    setContactPhone,
    setDisplayName,
    setSelectedPaymentMethod,
    submit,
    submitting,
    handleResend,
    resetForm,
  } = useRegisterForm(props)

  if (requestResult) {
    return (
      <RegistrationCreatedPanel
        amount={amount}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        displayName={displayName}
        effectiveParticipantType={effectiveParticipantType}
        requestResult={requestResult}
        resendFeedback={resendFeedback}
        resending={resending}
        selectedCategory={selectedCategory}
        tournamentId={props.tournamentId}
        tournamentTitle={props.tournamentTitle}
        onResend={(requestId) => void handleResend(requestId)}
        onReset={resetForm}
      />
    )
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
          {pendingRequestExpiresAt && (
            <p className="mt-2">
              La solicitud pendiente caduca el{" "}
              {formatDateTime(pendingRequestExpiresAt)}.
            </p>
          )}
        </div>
      )}

      {pendingRequestId && (
        <PendingRequestAlert
          pendingRequestExpiresAt={pendingRequestExpiresAt}
          pendingRequestId={pendingRequestId}
          resending={resending}
          onResend={() => void handleResend()}
        />
      )}

      <PaymentMethodField
        paymentMethod={props.paymentMethod}
        selectedPaymentMethod={selectedPaymentMethod}
        onChange={setSelectedPaymentMethod}
      />

      {props.hasCategories && (
        <CategoryField
          categories={props.categories}
          categoryId={categoryId}
          error={fieldErrors.categoryId}
          onChange={setCategoryId}
        />
      )}

      <ParticipantContactFields
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        displayName={displayName}
        effectiveParticipantType={effectiveParticipantType}
        fieldErrors={fieldErrors}
        onContactEmailChange={setContactEmail}
        onContactPhoneChange={setContactPhone}
        onDisplayNameChange={setDisplayName}
      />

      <AmountSummary
        amount={amount}
        paymentMethod={props.paymentMethod}
        selectedPaymentMethod={selectedPaymentMethod}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="secondary">
          <Link href={`/torneos/${props.tournamentId}`}>Volver al torneo</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Inscribiendo..." : "Inscribirse"}
        </Button>
      </div>
    </form>
  )
}
