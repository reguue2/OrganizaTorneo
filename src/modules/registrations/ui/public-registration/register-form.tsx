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
import type { RegisterFormProps } from "./types"
import { useRegisterForm } from "./use-register-form"
import { VerificationCodeModal } from "./verification-code-modal"

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
    selectedPaymentMethod,
    setCategoryId,
    setContactEmail,
    setContactPhone,
    setDisplayName,
    setSelectedPaymentMethod,
    submit,
    submitting,
    handleResend,
    closeVerificationModal,
    verificationCode,
    verificationError,
    verificationModalOpen,
    verificationResult,
    verifying,
    setVerificationCode,
    verifyCode,
  } = useRegisterForm(props)

  return (
    <>
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
            {submitting
              ? selectedPaymentMethod === "online"
                ? "Abriendo pago..."
                : "Enviando código..."
              : selectedPaymentMethod === "online"
                ? "Pagar e inscribirse"
                : "Inscribirse"}
          </Button>
        </div>
      </form>

      {verificationModalOpen && requestResult && (
        <VerificationCodeModal
          code={verificationCode}
          contactEmail={contactEmail}
          error={verificationError}
          requestResult={requestResult}
          resendFeedback={resendFeedback}
          resending={resending}
          result={verificationResult}
          verifying={verifying}
          onClose={closeVerificationModal}
          onCodeChange={setVerificationCode}
          onResend={() => void handleResend(requestResult.request_id)}
          onVerify={() => void verifyCode()}
        />
      )}
    </>
  )
}
