"use client"

import { type FormEvent, useEffect, useState } from "react"
import { X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { normalizeSpanishPhone } from "@/shared/contact/phone"

import { formatMoney } from "./display"

type SubmitResult = { ok: boolean; error?: string }

export function AddRegistrationModal({
  busy,
  groupName,
  hasCategories,
  onClose,
  onSubmit,
  participantType,
  price,
}: {
  busy: boolean
  groupName: string
  hasCategories: boolean
  onClose: () => void
  onSubmit: (input: {
    displayName: string
    contactPhone?: string
    contactEmail?: string
    markAsPaid: boolean
  }) => Promise<SubmitResult>
  participantType: "individual" | "team" | null
  price: number
}) {
  const [displayName, setDisplayName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [markAsPaid, setMarkAsPaid] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isFree = price <= 0
  const isTeam = participantType === "team"
  const nameLabel = isTeam ? "Nombre del equipo" : "Nombre del participante"

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onEscape)
    }
  }, [onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setError(`${nameLabel} es obligatorio.`)
      return
    }

    const normalizedPhone = contactPhone.trim()
      ? normalizeSpanishPhone(contactPhone)
      : null
    if (contactPhone.trim() && !normalizedPhone) {
      setError("Introduce un teléfono español válido.")
      return
    }

    setError(null)

    const result = await onSubmit({
      displayName: trimmedName,
      contactPhone: normalizedPhone ?? undefined,
      contactEmail: contactEmail.trim() || undefined,
      markAsPaid: isFree ? true : markAsPaid,
    })

    if (result.ok) {
      onClose()
      return
    }

    setError(result.error ?? "No se pudo añadir la inscripción.")
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/45"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-registration-title"
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl"
        >
          <CardHeader className="pr-16">
            <CardTitle id="add-registration-title">Añadir inscripción</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasCategories ? `Categoría: ${groupName}` : "Añade un participante manualmente"}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cerrar"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="manual-name">
                  {nameLabel} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="manual-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-phone">Teléfono (opcional)</Label>
                  <Input
                    id="manual-phone"
                    type="tel"
                    inputMode="tel"
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-email">Email (opcional)</Label>
                  <Input
                    id="manual-email"
                    type="email"
                    value={contactEmail}
                    onChange={(event) => setContactEmail(event.target.value)}
                  />
                </div>
              </div>

              {isFree ? (
                <Alert variant="info">
                  <AlertDescription>
                    Inscripción gratuita: se añadirá como confirmada.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="manual-payment">Estado del cobro ({formatMoney(price)})</Label>
                  <Select
                    id="manual-payment"
                    value={markAsPaid ? "paid" : "pending"}
                    onChange={(event) => setMarkAsPaid(event.target.value === "paid")}
                  >
                    <option value="paid">Confirmada</option>
                    <option value="pending">Pendiente</option>
                  </Select>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Añadiendo..." : "Añadir inscripción"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
