"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle2, AlertCircle } from "lucide-react"

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
import type { OrganizerProfile } from "@/modules/profile/domain"
import { updateOrganizerProfile } from "@/modules/profile/server/update-profile-action"
import { initialProfileActionState } from "@/modules/profile/server/profile-action-state"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Guardando…" : "Guardar cambios"}
    </Button>
  )
}

export function ProfileContactForm({ profile }: { profile: OrganizerProfile }) {
  const [state, formAction] = useActionState(
    updateOrganizerProfile,
    initialProfileActionState
  )

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>
            Tu nombre y datos de contacto como organizador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile.name}
              placeholder="Tu nombre o el de tu club"
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email de la cuenta</Label>
            <Input id="email" value={profile.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Es el email con el que inicias sesión.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone}
                placeholder="600 123 456"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                defaultValue={profile.whatsapp}
                placeholder="Puede ser el mismo que tu teléfono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto público</CardTitle>
          <CardDescription>
            Permite que los participantes te escriban para pagar o resolver dudas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <label
            htmlFor="public_contact"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4"
          >
            <input
              id="public_contact"
              name="public_contact"
              type="checkbox"
              defaultChecked={profile.publicContact}
              className="mt-0.5 size-4 rounded border-input accent-primary"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-foreground">
                Mostrar mi contacto en mis torneos
              </span>
              <span className="block text-xs leading-5 text-muted-foreground">
                Si lo activas, en la ficha pública de tus torneos aparecerán botones
                para contactarte por WhatsApp, teléfono o email.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {state.status !== "idle" && state.message && (
        <div
          className={
            state.status === "success"
              ? "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
          }
        >
          {state.status === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {state.message}
        </div>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
