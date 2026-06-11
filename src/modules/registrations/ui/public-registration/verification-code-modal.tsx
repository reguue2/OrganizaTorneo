import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { normalizeSixDigitCodeInput } from "@/shared/forms/numbers"

import type {
  RegistrationRequestResult,
  RegistrationVerificationResult,
} from "./types"

type VerificationCodeModalProps = {
  code: string
  contactEmail: string
  error: string | null
  requestResult: RegistrationRequestResult
  resendFeedback: string | null
  resending: boolean
  result: RegistrationVerificationResult | null
  verifying: boolean
  onClose: () => void
  onCodeChange: (value: string) => void
  onResend: () => void
  onVerify: () => void
}

function VerificationCodeModal({
  code,
  contactEmail,
  error,
  requestResult,
  resendFeedback,
  resending,
  result,
  verifying,
  onClose,
  onCodeChange,
  onResend,
  onVerify,
}: VerificationCodeModalProps) {
  const completed = Boolean(result)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="verification-modal-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        role="dialog"
      >
        {completed ? (
          <VerificationCompleted result={result} onClose={onClose} />
        ) : (
          <div className="space-y-5">
            <div>
              <h2
                id="verification-modal-title"
                className="text-xl font-semibold text-foreground"
              >
                Confirma tu email
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Hemos enviado un código de seis dígitos a{" "}
                <span className="font-medium text-foreground">{contactEmail}</span>.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resendFeedback && (
              <Alert variant="info">
                <AlertDescription>{resendFeedback}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="registration-verification-code">
                Código de verificación
              </Label>
              <Input
                id="registration-verification-code"
                autoComplete="one-time-code"
                className="mt-2 text-center text-lg tracking-[0.35em]"
                inputMode="numeric"
                maxLength={6}
                pattern="\\d{6}"
                placeholder="000000"
                value={code}
                onChange={(event) =>
                  onCodeChange(normalizeSixDigitCodeInput(event.target.value))
                }
                autoFocus
              />
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              El código caduca cuando expire la solicitud. Si no lo encuentras, revisa
              también la carpeta de spam.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                disabled={verifying}
                onClick={onClose}
              >
                Cerrar
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={resending || verifying}
                  onClick={onResend}
                >
                  {resending ? "Reenviando..." : "Reenviar código"}
                </Button>
                <Button
                  type="button"
                  disabled={code.length !== 6 || verifying}
                  onClick={onVerify}
                >
                  {verifying ? "Validando..." : "Validar código"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <span className="sr-only">Solicitud {requestResult.request_id}</span>
      </section>
    </div>
  )
}

function VerificationCompleted({
  result,
  onClose,
}: {
  result: RegistrationVerificationResult | null
  onClose: () => void
}) {
  const pendingCash = result?.registration_status === "pending_cash_validation"

  return (
    <div className="space-y-5">
      <div>
        <h2
          id="verification-modal-title"
          className="text-xl font-semibold text-foreground"
        >
          {pendingCash ? "Inscripción pendiente de pago" : "Inscripción confirmada"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {pendingCash
            ? "Tu email está validado. El organizador confirmará definitivamente tu inscripción cuando reciba el pago en efectivo."
            : "Tu email está validado y la inscripción ha quedado confirmada."}
        </p>
      </div>

      {result?.public_reference && (
        <Alert variant="success">
          <AlertDescription>
            Referencia de inscripción:{" "}
            <span className="font-semibold">{result.public_reference}</span>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </div>
  )
}

export { VerificationCodeModal }
