"use client"

import { type FormEvent, useEffect, useState } from "react"
import { X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  BRACKET_FORMAT_LABELS,
  type BracketFormat,
} from "@/modules/tournaments/domain"

import type { BracketConfig } from "./types"

const MIN_PARTICIPANTS = 2

export type BracketTarget = {
  categoryId: string | null
  name: string
  confirmedCount: number
  pendingCount: number
  hasBracket: boolean
}

type RowState = {
  included: boolean
  format: BracketFormat
  thirdPlace: boolean
  doubleRound: boolean
  groupCount: string
  qualifiers: string
}

function keyOf(target: BracketTarget) {
  return target.categoryId ?? "__general__"
}

function initialRow(target: BracketTarget): RowState {
  return {
    included: target.confirmedCount >= MIN_PARTICIPANTS,
    format: "single_elimination",
    thirdPlace: false,
    doubleRound: false,
    groupCount: "",
    qualifiers: "2",
  }
}

function parsePositiveInt(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

function optionsFor(row: RowState): BracketConfig["options"] {
  if (row.format === "single_elimination") return { thirdPlace: row.thirdPlace }
  if (row.format === "round_robin") return { doubleRound: row.doubleRound }
  return {
    groupCount: parsePositiveInt(row.groupCount),
    qualifiersPerGroup: parsePositiveInt(row.qualifiers),
  }
}

export function GenerateBracketModal({
  busy,
  hasCategories,
  onClose,
  onGenerate,
  targets,
}: {
  busy: boolean
  hasCategories: boolean
  onClose: () => void
  onGenerate: (configs: BracketConfig[]) => void
  targets: BracketTarget[]
}) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(targets.map((target) => [keyOf(target), initialRow(target)]))
  )

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

  const update = (key: string, patch: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const eligible = targets.filter((target) => target.confirmedCount >= MIN_PARTICIPANTS)
  const selectedCount = eligible.filter((target) => rows[keyOf(target)]?.included).length
  const allEligibleSelected = eligible.length > 0 && selectedCount === eligible.length
  const totalPending = targets.reduce((sum, target) => sum + target.pendingCount, 0)

  function toggleAll() {
    setRows((prev) => {
      const next = { ...prev }
      for (const target of eligible) {
        next[keyOf(target)] = { ...next[keyOf(target)], included: !allEligibleSelected }
      }
      return next
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const configs: BracketConfig[] = []
    for (const target of targets) {
      const row = rows[keyOf(target)]
      if (!row?.included || target.confirmedCount < MIN_PARTICIPANTS) continue
      configs.push({
        categoryId: target.categoryId,
        format: row.format,
        options: optionsFor(row),
      })
    }

    if (configs.length === 0) return
    onGenerate(configs)
  }

  const title = hasCategories ? "Generar cuadros" : "Generar cuadro del torneo"

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
          aria-labelledby="generate-bracket-title"
          className="relative flex max-h-[85vh] w-full max-w-md flex-col shadow-2xl"
        >
          <CardHeader className="shrink-0 p-4 pr-14">
            <CardTitle id="generate-bracket-title">{title}</CardTitle>
            {hasCategories && (
              <p className="mt-1 text-sm text-muted-foreground">
                Elige las categorías y el formato de cada cuadro.
              </p>
            )}
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

          <CardContent className="flex min-h-0 flex-auto flex-col p-4 pt-0">
            <form className="flex min-h-0 flex-auto flex-col gap-3" onSubmit={handleSubmit}>
              {totalPending > 0 && (
                <Alert variant="warning" className="shrink-0">
                  <AlertDescription>
                    {totalPending}{" "}
                    {totalPending === 1
                      ? "inscripción pendiente de validar no entrará"
                      : "inscripciones pendientes de validar no entrarán"}{" "}
                    en el cuadro. Valídalas en «Inscripciones» para incluirlas.
                  </AlertDescription>
                </Alert>
              )}

              {hasCategories && eligible.length > 1 && (
                <div className="flex shrink-0 items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedCount} de {eligible.length} categorías seleccionadas
                  </p>
                  <Button type="button" size="sm" variant="ghost" onClick={toggleAll}>
                    {allEligibleSelected ? "Quitar todas" : "Seleccionar todas"}
                  </Button>
                </div>
              )}

              <div className="-mr-1 min-h-0 flex-auto space-y-2 overflow-y-auto pr-1">
                {targets.map((target) => (
                  <TargetRow
                    key={keyOf(target)}
                    hasCategories={hasCategories}
                    onChange={(patch) => update(keyOf(target), patch)}
                    row={rows[keyOf(target)]}
                    target={target}
                  />
                ))}
              </div>

              {eligible.length === 0 && (
                <Alert variant="warning" className="shrink-0">
                  <AlertDescription>
                    Necesitas al menos {MIN_PARTICIPANTS} participantes confirmados
                    {hasCategories ? " en alguna categoría" : ""} para generar el cuadro.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex shrink-0 flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={busy || selectedCount === 0}>
                  {busy
                    ? "Generando..."
                    : selectedCount > 1
                      ? `Generar ${selectedCount} cuadros`
                      : "Generar cuadro"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TargetRow({
  hasCategories,
  onChange,
  row,
  target,
}: {
  hasCategories: boolean
  onChange: (patch: Partial<RowState>) => void
  row: RowState
  target: BracketTarget
}) {
  const enoughParticipants = target.confirmedCount >= MIN_PARTICIPANTS
  const active = enoughParticipants && (!hasCategories || row.included)

  return (
    <div
      className={
        active
          ? "rounded-lg border border-border p-3"
          : "rounded-lg border border-border bg-muted/30 p-3"
      }
    >
      <div className="flex items-start gap-3">
        {hasCategories && (
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={row.included}
            disabled={!enoughParticipants}
            onChange={(event) => onChange({ included: event.target.checked })}
            aria-label={`Generar cuadro de ${target.name}`}
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-foreground">{target.name}</span>
            {target.pendingCount > 0 && (
              <span className="text-xs text-amber-700">
                {target.pendingCount} sin validar
              </span>
            )}
          </div>

          {!enoughParticipants ? (
            <p className="mt-1 text-xs text-amber-700">
              Necesita al menos {MIN_PARTICIPANTS} confirmados.
            </p>
          ) : (
            active && (
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`format-${keyOf(target)}`}>Formato</Label>
                  <Select
                    id={`format-${keyOf(target)}`}
                    value={row.format}
                    onChange={(event) =>
                      onChange({ format: event.target.value as BracketFormat })
                    }
                  >
                    <option value="single_elimination">
                      {BRACKET_FORMAT_LABELS.single_elimination}
                    </option>
                    <option value="round_robin">
                      {BRACKET_FORMAT_LABELS.round_robin}
                    </option>
                    <option value="groups_knockout">
                      {BRACKET_FORMAT_LABELS.groups_knockout}
                    </option>
                  </Select>
                </div>

                <FormatOptions onChange={onChange} row={row} target={target} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function FormatOptions({
  onChange,
  row,
  target,
}: {
  onChange: (patch: Partial<RowState>) => void
  row: RowState
  target: BracketTarget
}) {
  if (row.format === "single_elimination") {
    return (
      <CheckboxRow
        checked={row.thirdPlace}
        label="Incluir partido por el 3.er y 4.º puesto"
        onChange={(thirdPlace) => onChange({ thirdPlace })}
      />
    )
  }

  if (row.format === "round_robin") {
    return (
      <CheckboxRow
        checked={row.doubleRound}
        label="Ida y vuelta (cada cruce se juega dos veces)"
        onChange={(doubleRound) => onChange({ doubleRound })}
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor={`groups-${keyOf(target)}`}>Número de grupos</Label>
        <Input
          id={`groups-${keyOf(target)}`}
          type="text"
          inputMode="numeric"
          placeholder="Automático"
          value={row.groupCount}
          onChange={(event) => onChange({ groupCount: digitsOnly(event.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`qualifiers-${keyOf(target)}`}>Clasifican por grupo</Label>
        <Input
          id={`qualifiers-${keyOf(target)}`}
          type="text"
          inputMode="numeric"
          value={row.qualifiers}
          onChange={(event) => onChange({ qualifiers: digitsOnly(event.target.value) })}
        />
      </div>
    </div>
  )
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      <span className="text-foreground">{label}</span>
    </label>
  )
}
