import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { formatMoney } from "@/modules/tournaments/domain"

import { formatDateTime } from "./display"
import type {
  Category,
  ParticipantType,
  RegistrationFormFieldErrors,
  RegistrationPaymentMethod,
} from "./types"

function PendingRequestAlert({
  pendingRequestExpiresAt,
  resending,
  onResend,
}: {
  pendingRequestExpiresAt: string | null
  resending: boolean
  onResend: () => void
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Ya hay una solicitud pendiente</p>
      <p className="mt-2">
        No vamos a crear otra igual mientras siga activa. Reenvía el código para
        continuar la validación.
      </p>
      {pendingRequestExpiresAt && (
        <p className="mt-2">
          Caduca el {formatDateTime(pendingRequestExpiresAt)}.
        </p>
      )}
      <div className="mt-4">
        <Button
          type="button"
          onClick={onResend}
          disabled={resending}
          variant="secondary"
        >
          {resending ? "Reenviando..." : "Reenviar correo"}
        </Button>
      </div>
    </div>
  )
}

function PaymentMethodField({
  paymentMethod,
  selectedPaymentMethod,
  onChange,
}: {
  paymentMethod: "cash" | "online" | "both" | null
  selectedPaymentMethod: RegistrationPaymentMethod
  onChange: (value: RegistrationPaymentMethod) => void
}) {
  if (paymentMethod === "both") {
    return (
      <div className="space-y-3">
        <Label>
          Método de pago <span className="text-red-500">*</span>
        </Label>

        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentOption
            active={selectedPaymentMethod === "cash"}
            title="Efectivo"
            description="Paga el importe directamente al organizador."
            onClick={() => onChange("cash")}
          />
          <PaymentOption
            active={selectedPaymentMethod === "online"}
            title="Online"
            description="Paga online al completar la inscripción."
            onClick={() => onChange("online")}
          />
        </div>
      </div>
    )
  }

  return null
}

function PaymentOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-4 text-left transition ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:bg-muted"
      }`}
    >
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

function CategoryField({
  categories,
  categoryId,
  error,
  onChange,
}: {
  categories: Category[]
  categoryId: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <Label>
        Categoría <span className="text-red-500">*</span>
      </Label>
      <Select
        value={categoryId}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={
          error
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
            : undefined
        }
      >
        <option value="">Selecciona una categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function ParticipantContactFields({
  contactEmail,
  contactPhone,
  displayName,
  effectiveParticipantType,
  fieldErrors,
  onContactEmailChange,
  onContactPhoneChange,
  onDisplayNameChange,
}: {
  contactEmail: string
  contactPhone: string
  displayName: string
  effectiveParticipantType: ParticipantType | null
  fieldErrors: RegistrationFormFieldErrors
  onContactEmailChange: (value: string) => void
  onContactPhoneChange: (value: string) => void
  onDisplayNameChange: (value: string) => void
}) {
  return (
    <>
      <div>
        <Label>
          {effectiveParticipantType === "team" ? "Nombre del equipo" : "Nombre completo"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder={
            effectiveParticipantType === "team" ? "Nombre del equipo" : "Nombre del participante"
          }
          aria-invalid={Boolean(fieldErrors.displayName)}
        />
        {fieldErrors.displayName && (
          <p className="mt-2 text-sm text-destructive">{fieldErrors.displayName}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Teléfono de contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            type="tel"
            inputMode="tel"
            value={contactPhone}
            onChange={(event) => onContactPhoneChange(event.target.value)}
            placeholder="Telefono de contacto"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.contactPhone)}
          />
          {fieldErrors.contactPhone && (
            <p className="mt-2 text-sm text-destructive">{fieldErrors.contactPhone}</p>
          )}
        </div>

        <div>
          <Label>
            Email de contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            value={contactEmail}
            onChange={(event) => onContactEmailChange(event.target.value)}
            placeholder={
              effectiveParticipantType === "team"
                ? "Correo de contacto"
                : "Correo de contacto"
            }
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.contactEmail)}
          />
          {fieldErrors.contactEmail && (
            <p className="mt-2 text-sm text-destructive">{fieldErrors.contactEmail}</p>
          )}
        </div>
      </div>
    </>
  )
}

function AmountSummary({
  amount,
  paymentMethod,
  selectedPaymentMethod,
}: {
  amount: number | null
  paymentMethod: "cash" | "online" | "both" | null
  selectedPaymentMethod: RegistrationPaymentMethod
}) {
  const isFree = amount !== null && Number(amount) <= 0
  const showFixedPaymentDescription =
    !isFree && (paymentMethod === "cash" || paymentMethod === "online")
  const paymentTitle = selectedPaymentMethod === "cash"
    ? "Pago en efectivo"
    : "Pago online"
  const paymentDescription = selectedPaymentMethod === "cash"
    ? "paga el precio directamente al organizador"
    : "paga online al completar la inscripción"

  return (
    <div>
      <div className="border-y border-border px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-base font-semibold text-foreground">Precio</p>
          <p className="text-2xl font-semibold text-foreground">
            {amount === null ? "Selecciona categoría" : formatMoney(amount)}
          </p>
        </div>
      </div>

      {showFixedPaymentDescription && (
        <p className="px-4 pt-3 text-sm leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">{paymentTitle}</span>,{" "}
          {paymentDescription}.
        </p>
      )}
    </div>
  )
}

export {
  AmountSummary,
  CategoryField,
  ParticipantContactFields,
  PaymentMethodField,
  PendingRequestAlert,
}
