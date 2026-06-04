import Link from "next/link"

import { Button } from "@/components/ui/button"
import { normalizeSpanishPhone } from "@/modules/registrations/domain"
import {
  formatMoney,
  getParticipantTypeLabel,
} from "@/modules/tournaments/domain"

import { formatDateTime, getDeliveryTone } from "./display"
import type {
  Category,
  ParticipantType,
  RegistrationRequestResult,
} from "./types"

type RegistrationCreatedPanelProps = {
  amount: number | null
  contactEmail: string
  contactPhone: string
  displayName: string
  effectiveParticipantType: ParticipantType | null
  requestResult: RegistrationRequestResult
  resendFeedback: string | null
  resending: boolean
  selectedCategory: Category | null
  tournamentId: string
  tournamentTitle: string
  onResend: (requestId: string) => void
  onReset: () => void
}

function RegistrationCreatedPanel({
  amount,
  contactEmail,
  contactPhone,
  displayName,
  effectiveParticipantType,
  requestResult,
  resendFeedback,
  resending,
  selectedCategory,
  tournamentId,
  tournamentTitle,
  onResend,
  onReset,
}: RegistrationCreatedPanelProps) {
  const isFree = Number(amount ?? 0) <= 0

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
        <h3 className="text-lg font-semibold text-emerald-900">Solicitud creada</h3>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Hemos preparado tu solicitud de inscripción. El siguiente paso es validar el
          email antes de crear la inscripción real.
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          Caduca el {formatDateTime(requestResult.expires_at)}.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 text-sm text-card-foreground">
        <SummaryRow label="Torneo" value={tournamentTitle} />
        <SummaryRow
          label="Formato"
          value={getParticipantTypeLabel(effectiveParticipantType)}
        />
        {selectedCategory && (
          <SummaryRow label="Categoría" value={selectedCategory.name} />
        )}
        <SummaryRow label="Nombre" value={displayName} />
        <SummaryRow label="Email" value={contactEmail} />
        <SummaryRow
          label="Teléfono"
          value={normalizeSpanishPhone(contactPhone) ?? contactPhone}
        />
        <SummaryRow
          label="Importe"
          value={amount === null ? "Selecciona categoría" : formatMoney(amount)}
        />
        <SummaryRow
          label="Canal de pago"
          value={requestResult.payment_method === "cash" ? "Efectivo" : "Online"}
        />
        <SummaryRow
          label="Qué pasará al verificar"
          value={
            isFree
              ? "La inscripción quedará confirmada automáticamente."
              : requestResult.payment_method === "cash"
                ? "La inscripción quedará creada y pendiente de validación manual del organizador."
                : "La inscripción quedará creada y pendiente del flujo de pago online."
          }
        />
      </div>

      <div
        className={`rounded-lg border p-5 text-sm ${getDeliveryTone(
          requestResult.email_delivery_status
        )}`}
      >
        <p className="font-semibold">
          {requestResult.email_delivery_status === "sent"
            ? "Correo de verificación enviado"
            : requestResult.email_delivery_status === "provider_not_configured"
              ? "Proveedor de correo pendiente de terminar"
              : "El correo no se pudo enviar"}
        </p>
        <p className="mt-2">{requestResult.email_delivery_message}</p>
        {resendFeedback && <p className="mt-2">{resendFeedback}</p>}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            onClick={() => onResend(requestResult.request_id)}
            disabled={resending}
            variant="secondary"
          >
            {resending ? "Reenviando..." : "Reenviar correo de verificación"}
          </Button>
          <Button asChild variant="secondary">
            <Link
              href={`/inscripcion/verificar?request=${encodeURIComponent(
                requestResult.request_id
              )}`}
            >
              Ir a validación manual
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="secondary">
          <Link href={`/torneos/${tournamentId}`}>Volver al torneo</Link>
        </Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          Crear otra solicitud
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="mt-2 first:mt-0">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </p>
  )
}

export { RegistrationCreatedPanel }
