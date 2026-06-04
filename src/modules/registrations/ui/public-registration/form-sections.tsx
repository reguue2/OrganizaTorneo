import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  formatMoney,
  getParticipantTypeLabel,
} from "@/modules/tournaments/domain"

import { formatDateTime } from "./display"
import type {
  Category,
  ParticipantType,
  RegistrationPaymentMethod,
} from "./types"

function PendingRequestAlert({
  pendingRequestExpiresAt,
  pendingRequestId,
  resending,
  onResend,
}: {
  pendingRequestExpiresAt: string | null
  pendingRequestId: string | null
  resending: boolean
  onResend: () => void
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Ya hay una solicitud pendiente</p>
      <p className="mt-2">
        No vamos a crear otra igual mientras siga activa. Puedes reenviar el correo de
        verificación de esa solicitud.
      </p>
      {pendingRequestExpiresAt && (
        <p className="mt-2">
          Caduca el {formatDateTime(pendingRequestExpiresAt)}.
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          onClick={onResend}
          disabled={resending}
          variant="secondary"
        >
          {resending ? "Reenviando..." : "Reenviar correo"}
        </Button>
        <Button asChild variant="secondary">
          <Link
            href={`/inscripcion/verificar?request=${encodeURIComponent(
              pendingRequestId ?? ""
            )}`}
          >
            Ir a validación manual
          </Link>
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
          Canal de pago <span className="text-red-500">*</span>
        </Label>

        <div className="grid gap-3 sm:grid-cols-2">
          <PaymentOption
            active={selectedPaymentMethod === "cash"}
            title="Efectivo"
            description="El organizador validará manualmente el cobro."
            onClick={() => onChange("cash")}
          />
          <PaymentOption
            active={selectedPaymentMethod === "online"}
            title="Online"
            description="Quedará preparada para el flujo online cuando esté conectado."
            onClick={() => onChange("online")}
          />
        </div>
      </div>
    )
  }

  if (!paymentMethod) return null

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
      <p>
        <span className="font-medium text-foreground">Canal de pago configurado:</span>{" "}
        {paymentMethod === "cash" ? "Solo pagos en efectivo" : "Solo pagos online"}
      </p>
    </div>
  )
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
  onChange,
}: {
  categories: Category[]
  categoryId: string
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
      >
        <option value="">Selecciona una categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name} · {getParticipantTypeLabel(category.participant_type)} ·{" "}
            {formatMoney(category.price)}
          </option>
        ))}
      </Select>
    </div>
  )
}

function ParticipantContactFields({
  contactEmail,
  contactPhone,
  displayName,
  effectiveParticipantType,
  hasCategories,
  onContactEmailChange,
  onContactPhoneChange,
  onDisplayNameChange,
}: {
  contactEmail: string
  contactPhone: string
  displayName: string
  effectiveParticipantType: ParticipantType | null
  hasCategories: boolean
  onContactEmailChange: (value: string) => void
  onContactPhoneChange: (value: string) => void
  onDisplayNameChange: (value: string) => void
}) {
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-card-foreground">
        <p>
          <span className="font-medium text-foreground">Formato de inscripción:</span>{" "}
          {getParticipantTypeLabel(effectiveParticipantType)}
        </p>
        <p className="mt-2 text-muted-foreground">
          {effectiveParticipantType === "team"
            ? "Esta inscripción representa a un equipo. Solo pediremos el nombre del equipo y el contacto de quien realiza la inscripción."
            : effectiveParticipantType === "individual"
              ? "Esta inscripción representa a una sola persona."
              : hasCategories
                ? "Selecciona una categoría para ver qué formato de inscripción aplica."
                : "El organizador todavía no ha configurado el formato de inscripción."}
        </p>
      </div>

      <div>
        <Label>
          {effectiveParticipantType === "team" ? "Nombre del equipo" : "Nombre completo"}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder={
            effectiveParticipantType === "team" ? "Ej: FC Warriors" : "Ej: Diego Martínez"
          }
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>
            Teléfono de contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            value={contactPhone}
            onChange={(event) => onContactPhoneChange(event.target.value)}
            placeholder="Ej: 612345678 o +34 612 345 678"
            autoComplete="tel"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Solo aceptamos teléfonos españoles válidos.
          </p>
        </div>

        <div>
          <Label>
            Email de contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            value={contactEmail}
            onChange={(event) => onContactEmailChange(event.target.value)}
            placeholder={
              effectiveParticipantType === "team" ? "Ej: equipo@correo.com" : "Ej: jugador@correo.com"
            }
            autoComplete="email"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Lo usamos para validar la solicitud y enviarte después la referencia de la inscripción.
          </p>
        </div>
      </div>
    </>
  )
}

function AmountSummary({
  amount,
  selectedPaymentMethod,
}: {
  amount: number | null
  selectedPaymentMethod: RegistrationPaymentMethod
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Importe</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {amount === null ? "Selecciona categoría" : formatMoney(amount)}
          </p>
        </div>

        <div className="text-right text-sm text-muted-foreground">
          {amount !== null && Number(amount) <= 0 ? (
            <p>Inscripción gratuita</p>
          ) : selectedPaymentMethod === "cash" ? (
            <p>Pago en efectivo con validación manual</p>
          ) : (
            <p>Pago online pendiente de integración completa</p>
          )}
        </div>
      </div>
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
