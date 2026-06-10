"use client"

import {
  Eye,
  ImageIcon,
  LockKeyhole,
  MapPin,
  Save,
  Settings2,
  Trophy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DateTimeField } from "@/components/ui/date-time-field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { TournamentRow } from "@/modules/organizer/domain"

import { Card, CardContent, CardHeader, CardTitle } from "./dashboard-cards"
import { canEditTournamentConfig } from "./display"
import {
  CapacityInput,
  Field,
  ManagementConfigCategories,
  MoneyInput,
} from "./management-config-categories"
import { ManagementConfigPoster } from "./management-config-poster"
import type { ManageDashboardViewModel } from "./use-manage-dashboard"

type PosterAction = "keep" | "remove" | "replace"

export function ManagementConfigForm({
  dashboard,
  tournament,
}: {
  dashboard: ManageDashboardViewModel
  tournament: TournamentRow
}) {
  const {
    brackets,
    busy,
    form,
    registrationViews,
    saveConfig,
    setForm,
  } = dashboard
  const canEdit = canEditTournamentConfig(tournament)
  const registrationSettingsLocked = registrationViews.length > 0
  const [posterAction, setPosterAction] = useState<PosterAction>("keep")
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterFileName, setPosterFileName] = useState("")
  const [posterPreview, setPosterPreview] = useState<string | null>(
    tournament.poster_url
  )
  const [posterError, setPosterError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (posterPreview?.startsWith("blob:")) URL.revokeObjectURL(posterPreview)
    }
  }, [posterPreview])

  const updateForm = <Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key]
  ) => {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  const selectPoster = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setPosterError("El cartel debe ser JPG, PNG, WebP o GIF.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPosterError("El cartel no puede superar los 5MB.")
      return
    }

    setPosterError(null)
    setPosterFile(file)
    setPosterFileName(file.name)
    setPosterAction("replace")
    setPosterPreview(URL.createObjectURL(file))
  }

  const clearPoster = () => {
    setPosterError(null)
    setPosterFile(null)
    setPosterFileName("")
    setPosterAction("remove")
    setPosterPreview(null)
  }

  const submit = async () => {
    const saved = await saveConfig({ poster: posterFile, posterAction })
    window.scrollTo({ top: 0, behavior: "smooth" })
    if (saved) {
      setPosterFile(null)
      setPosterFileName("")
      setPosterAction("keep")
    }
  }

  return (
    <div className="space-y-6">
      {!canEdit && (
        <Alert variant="warning">
          <AlertTitle>Edición bloqueada</AlertTitle>
          <AlertDescription>
            Un torneo finalizado o cancelado conserva su configuración como histórico.
          </AlertDescription>
        </Alert>
      )}

      <ConfigCard icon={ImageIcon} title="Publicación y cartel">
        <ManagementConfigPoster
          disabled={!canEdit}
          fileName={posterFileName}
          onClear={clearPoster}
          onSelect={selectPoster}
          previewUrl={posterPreview}
        />
        {posterError && <p className="text-sm text-destructive">{posterError}</p>}

        <label className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
          <span>
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Eye className="size-4" />
              Visible en el explorador
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Si lo desactivas, seguirá disponible mediante enlace directo.
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.is_public}
            disabled={!canEdit}
            onChange={(event) => updateForm("is_public", event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
        </label>
      </ConfigCard>

      <ConfigCard icon={MapPin} title="Información pública">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Título del torneo">
              <Input
                value={form.title}
                disabled={!canEdit}
                onChange={(event) => updateForm("title", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Provincia">
            <Input
              value={form.province}
              disabled={!canEdit}
              onChange={(event) => updateForm("province", event.target.value)}
            />
          </Field>
          <Field label="Dirección">
            <Input
              value={form.address}
              disabled={!canEdit}
              onChange={(event) => updateForm("address", event.target.value)}
            />
          </Field>
          <Field label="Fecha del torneo">
            <DateTimeField
              value={form.date}
              disabled={!canEdit}
              onChange={(value) => updateForm("date", value)}
              placeholder="Elige fecha y hora"
            />
          </Field>
          <Field label="Fecha límite de inscripción">
            <DateTimeField
              value={form.registration_deadline}
              disabled={!canEdit}
              onChange={(value) => updateForm("registration_deadline", value)}
              placeholder="Elige cierre"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descripción">
              <Textarea
                value={form.description}
                disabled={!canEdit}
                className="min-h-32 resize-none"
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Explica en qué consiste el torneo"
              />
            </Field>
          </div>
        </div>
      </ConfigCard>

      <ConfigCard icon={Settings2} title="Inscripción y plazas">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Método de pago">
            <Select
              value={form.payment_method}
              disabled={!canEdit}
              onChange={(event) =>
                updateForm(
                  "payment_method",
                  event.target.value as "cash" | "online" | "both"
                )
              }
            >
              <option value="cash">Efectivo</option>
              <option value="online">Online</option>
              <option value="both">Efectivo y online</option>
            </Select>
          </Field>

          <Field label="Estructura">
            <div className="flex h-10 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
              <LockKeyhole className="mr-2 size-4" />
              {tournament.has_categories ? "Con categorías" : "Sin categorías"}
            </div>
          </Field>

          {!tournament.has_categories && (
            <>
              <Field label="Formato de inscripción">
                <Select
                  value={form.participant_type ?? "individual"}
                  disabled={!canEdit || registrationSettingsLocked}
                  onChange={(event) =>
                    updateForm(
                      "participant_type",
                      event.target.value as "individual" | "team"
                    )
                  }
                >
                  <option value="individual">Individual</option>
                  <option value="team">Equipos</option>
                </Select>
              </Field>
              <Field label="Precio de inscripción">
                <MoneyInput
                  value={form.entry_price}
                  disabled={!canEdit || registrationSettingsLocked}
                  onChange={(value) => updateForm("entry_price", value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Plazas disponibles">
                  <CapacityInput
                    capacity={form.max_participants}
                    disabled={!canEdit}
                    noMax={form.no_max_participants}
                    onCapacityChange={(value) => updateForm("max_participants", value)}
                    onNoMaxChange={(checked) =>
                      updateForm("no_max_participants", checked)
                    }
                  />
                </Field>
              </div>
            </>
          )}
        </div>

        {tournament.has_categories && (
          <ManagementConfigCategories
            brackets={brackets}
            canEdit={canEdit}
            form={form}
            registrations={registrationViews.map((view) => view.registration)}
            setForm={setForm}
          />
        )}
      </ConfigCard>

      <ConfigCard icon={Trophy} title="Premios y normas">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Modalidad de premios">
            <Select
              value={form.prize_mode}
              disabled={!canEdit}
              onChange={(event) =>
                updateForm(
                  "prize_mode",
                  event.target.value as "none" | "global" | "per_category"
                )
              }
            >
              <option value="none">Sin premios</option>
              <option value="global">Premios globales</option>
              {tournament.has_categories && (
                <option value="per_category">Premios por categoría</option>
              )}
            </Select>
          </Field>
        </div>

        {form.prize_mode === "global" && (
          <Field label="Premios globales">
            <Textarea
              value={form.prizes}
              disabled={!canEdit}
              className="min-h-28 resize-none"
              onChange={(event) => updateForm("prizes", event.target.value)}
              placeholder="Describe premios, trofeos o recompensas"
            />
          </Field>
        )}

        {form.prize_mode === "per_category" && (
          <Alert variant="info">
            <AlertDescription>
              Edita los premios dentro de cada categoría en el bloque anterior.
            </AlertDescription>
          </Alert>
        )}

        <Field label="Reglas / normativa">
          <Textarea
            value={form.rules}
            disabled={!canEdit}
            className="min-h-40 resize-none"
            onChange={(event) => updateForm("rules", event.target.value)}
            placeholder="Normativa, formato, condiciones y requisitos"
          />
        </Field>
      </ConfigCard>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-foreground">Guarda todos los cambios juntos</p>
        <Button
          type="button"
          size="lg"
          disabled={busy === "save-config" || !canEdit}
          onClick={submit}
        >
          <Save className="size-4" />
          {busy === "save-config" ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  )
}

function ConfigCard({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode
  icon: LucideIcon
  title: string
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-5">{children}</CardContent>
    </Card>
  )
}
