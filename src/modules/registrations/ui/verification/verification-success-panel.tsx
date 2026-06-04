import Link from "next/link"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatMoney } from "@/modules/tournaments/domain"

import {
  getVerificationDeliveryTitle,
  getVerificationDeliveryVariant,
  getVerificationNextStepMessage,
  getVerificationStatusLabel,
} from "./display"
import type { VerificationResult } from "./types"

type VerificationSuccessPanelProps = {
  cancelUrl: string | null
  result: VerificationResult
}

function VerificationSuccessPanel({
  cancelUrl,
  result,
}: VerificationSuccessPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
            {result.already_verified ? "Inscripción ya verificada" : "Inscripción creada"}
        </CardTitle>
        <CardDescription>{getVerificationNextStepMessage(result)}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        <div className="grid gap-4 rounded-lg border border-border bg-muted/30 p-5 text-sm sm:grid-cols-2">
          <ResultItem label="Referencia pública" value={result.public_reference ?? "—"} />
          <ResultItem
            label="Estado"
            value={getVerificationStatusLabel(result.registration_status)}
          />
          <ResultItem
            label="Canal de pago"
            value={
              result.payment_method === "cash"
                ? "Efectivo"
                : result.payment_method === "online"
                  ? "Online"
                  : "—"
            }
          />
          <ResultItem label="Importe" value={formatMoney(result.amount ?? null)} />
        </div>

        <Alert variant="info">
          <AlertTitle>Cancelación pública</AlertTitle>
          <AlertDescription>
            Guarda la referencia y el acceso de cancelación. No dependes del organizador para
            anular la inscripción.
            {cancelUrl && (
              <span className="mt-3 block break-all">
                <span className="font-medium">Enlace de cancelación:</span> {cancelUrl}
              </span>
            )}
            {result.cancel_code && (
              <span className="mt-3 block">
                <span className="font-medium">Código de cancelación:</span>{" "}
                {result.cancel_code}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {!result.already_verified && result.email_delivery_message && (
          <Alert variant={getVerificationDeliveryVariant(result.email_delivery_status)}>
            <AlertTitle>
              {getVerificationDeliveryTitle(result.email_delivery_status)}
            </AlertTitle>
            <AlertDescription>{result.email_delivery_message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary">
            <Link href="/explorar">Volver a explorar</Link>
          </Button>
          {cancelUrl && (
            <Button asChild>
              <Link href={cancelUrl}>Ir a cancelación</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}

export { VerificationSuccessPanel }
