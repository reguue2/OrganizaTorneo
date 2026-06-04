"use client"

import Link from "next/link"
import { useState } from "react"
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

import {
  getCancellationStatusLabel,
  mapCancellationErrorMessage,
} from "./display"
import type { CancelErrorPayload, CancelFlowProps, CancelResult, FlowStatus } from "./types"

export default function CancelFlow({
  initialReference,
  initialToken,
  initialCode,
}: CancelFlowProps) {
  const [reference, setReference] = useState(initialReference)
  const token = initialToken
  const [code, setCode] = useState(initialCode)
  const [flowStatus, setFlowStatus] = useState<FlowStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CancelResult | null>(null)

  const hasLinkAccess = Boolean(token)
  const canSubmitWithCode = reference.trim() !== "" && code.trim() !== ""
  const canSubmitWithToken = reference.trim() !== "" && token.trim() !== ""

  const submitCancellation = async (mode: "token" | "code") => {
    if (mode === "token" && !canSubmitWithToken) return
    if (mode === "code" && !canSubmitWithCode) return

    setFlowStatus("submitting")
    setError(null)

    try {
      const response = await fetch("/api/public-registration-cancellations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicReference: reference.trim(),
          cancelToken: mode === "token" ? token.trim() : undefined,
          cancelCode: mode === "code" ? code.trim() : undefined,
        }),
      })

      const payload = (await response.json()) as CancelResult | CancelErrorPayload

      if (!response.ok) {
        const errorPayload = payload as CancelErrorPayload

        setFlowStatus("error")
        setError(
          mapCancellationErrorMessage(
            errorPayload.error ?? "No se pudo cancelar la inscripción.",
            errorPayload.code
          )
        )
        return
      }

      setResult(payload as CancelResult)
      setFlowStatus("success")
    } catch {
      setFlowStatus("error")
      setError("No se pudo cancelar la inscripción.")
    }
  }

  if (flowStatus === "success" && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {result.already_cancelled ? "Inscripción ya cancelada" : "Inscripción cancelada"}
          </CardTitle>
          <CardDescription>
            {result.already_cancelled
              ? "Esta inscripción ya estaba cancelada."
              : "La inscripción se ha cancelado correctamente."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

        <div className="rounded-lg border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Referencia:</span>{" "}
            {result.public_reference ?? reference}
          </p>
          <p className="mt-2">
            <span className="font-medium text-foreground">Estado:</span>{" "}
            {getCancellationStatusLabel(result.status)}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/explorar">Volver a explorar torneos</Link>
          </Button>
        </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Cancelar inscripción</CardTitle>
        <CardDescription>
          La cancelación ya no se ejecuta al abrir el enlace. Aquí la confirmas de forma
          explícita.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

      {flowStatus === "submitting" && (
        <Alert variant="warning">
          <AlertDescription>Cancelando inscripción...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasLinkAccess ? (
        <section className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
          <div>
            <h2 className="font-semibold text-foreground">Acceso por enlace</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Abrir el enlace no cancela nada por sí solo. Tienes que confirmarlo aquí.
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Referencia</p>
            <p className="mt-1 font-medium text-foreground">{reference || "—"}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submitCancellation("token")}
              disabled={flowStatus === "submitting" || !canSubmitWithToken}
            >
              {flowStatus === "submitting" ? "Cancelando..." : "Confirmar cancelación"}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/explorar">No cancelar</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="font-semibold text-foreground">Cancelación manual por código</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Úsalo si tienes la referencia pública y el código, pero no el enlace completo.
          </p>
        </div>

        <div>
          <Label>Referencia pública</Label>
          <Input
            className="mt-2"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Referencia pública"
          />
        </div>

        <div>
          <Label>Código de cancelación</Label>
          <Input
            className="mt-2"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código de cancelación"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="destructive"
            onClick={() => void submitCancellation("code")}
            disabled={flowStatus === "submitting" || !canSubmitWithCode}
          >
            {flowStatus === "submitting" ? "Cancelando..." : "Cancelar con código"}
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
