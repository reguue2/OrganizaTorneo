"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mapVerificationErrorMessage } from "./display"
import type {
  ErrorPayload,
  FlowStatus,
  SubmitMode,
  VerificationResult,
  VerifyFlowProps,
} from "./types"
import { VerificationSuccessPanel } from "./verification-success-panel"

export default function VerifyFlow({
  initialRequestId,
  initialToken,
  initialCode,
}: VerifyFlowProps) {
  const [requestId, setRequestId] = useState(initialRequestId)
  const token = initialToken
  const [code, setCode] = useState(initialCode)
  const [flowStatus, setFlowStatus] = useState<FlowStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const hasLinkAccess = Boolean(token)
  const canSubmitWithCode = requestId.trim() !== "" && code.trim() !== ""

  const cancelUrl = useMemo(() => {
    if (!result?.public_reference || !result.cancel_token) return null

    const params = new URLSearchParams({
      reference: result.public_reference,
      token: result.cancel_token,
    })

    return `/inscripcion/cancelar?${params.toString()}`
  }, [result])

  const submitVerification = async (mode: SubmitMode) => {
    if (mode === "token" && !token) return
    if (mode === "code" && !canSubmitWithCode) return

    setFlowStatus("submitting")
    setError(null)

    try {
      const response = await fetch("/api/public-registration-verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId.trim(),
          verificationToken: mode === "token" ? token : undefined,
          verificationCode: mode === "code" ? code.trim() : undefined,
        }),
      })

      const payload = (await response.json()) as VerificationResult | ErrorPayload

      if (!response.ok) {
        const errorPayload = payload as ErrorPayload

        setFlowStatus("error")
        setError(
          mapVerificationErrorMessage(
            errorPayload.error ?? "No se pudo validar la solicitud.",
            errorPayload.code
          )
        )
        return
      }

      setResult(payload as VerificationResult)
      setFlowStatus("success")
    } catch {
      setFlowStatus("error")
      setError("No se pudo validar la solicitud.")
    }
  }

  if (flowStatus === "success" && result) {
    return <VerificationSuccessPanel cancelUrl={cancelUrl} result={result} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Validar inscripción</CardTitle>
        <CardDescription>
          Puedes validar con el enlace recibido por correo o pegando manualmente el
          identificador de solicitud y el código que llegue en ese mensaje.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

      {flowStatus === "submitting" && (
        <Alert variant="info">
          <AlertDescription>Validando la solicitud...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasLinkAccess ? (
        <section className="rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <h2 className="font-semibold text-foreground">Acceso por enlace</h2>
          <p className="mt-2">
            El enlace ya incluye el token. Aquí confirmas explícitamente la validación antes de
            crear la inscripción real.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => void submitVerification("token")}
              disabled={flowStatus === "submitting"}
            >
              {flowStatus === "submitting" ? "Validando..." : "Validar con enlace"}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="font-semibold text-foreground">Validación manual por código</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Úsalo si no tienes el enlace completo pero sí el identificador de solicitud y el
            código recibido por correo.
          </p>
        </div>

        <div>
          <Label>Identificador de solicitud</Label>
          <Input
            className="mt-2"
            value={requestId}
            onChange={(event) => setRequestId(event.target.value)}
            placeholder="UUID de la solicitud"
          />
        </div>

        <div>
          <Label>Código de verificación</Label>
          <Input
            className="mt-2"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código recibido"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => void submitVerification("code")}
            disabled={flowStatus === "submitting" || !canSubmitWithCode}
          >
            {flowStatus === "submitting" ? "Validando..." : "Validar con código"}
          </Button>
          <Button asChild variant="secondary">
            <Link href="/explorar">Volver a explorar</Link>
          </Button>
        </div>
      </section>
      </CardContent>
    </Card>
  )
}
