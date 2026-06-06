"use client"

import { useEffect, useState } from "react"
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
  type BracketOptions,
} from "@/modules/tournaments/domain"

const MIN_PARTICIPANTS = 2

function parsePositiveInt(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function GenerateBracketModal({
  busy,
  confirmedCount,
  hasCategories,
  hasExistingBracket,
  onClose,
  onGenerate,
  open,
  pendingCount,
}: {
  busy: boolean
  confirmedCount: number
  hasCategories: boolean
  hasExistingBracket: boolean
  onClose: () => void
  onGenerate: (format: BracketFormat, options: BracketOptions) => void
  open: boolean
  pendingCount: number
}) {
  const [format, setFormat] = useState<BracketFormat>("single_elimination")
  const [thirdPlace, setThirdPlace] = useState(false)
  const [doubleRound, setDoubleRound] = useState(false)
  const [groupCount, setGroupCount] = useState("")
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState("2")

  useEffect(() => {
    if (!open) return

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
  }, [open, onClose])

  if (!open) return null

  const notEnoughParticipants = confirmedCount < MIN_PARTICIPANTS

  function handleGenerate() {
    const options: BracketOptions =
      format === "single_elimination"
        ? { thirdPlace }
        : format === "round_robin"
          ? { doubleRound }
          : {
              groupCount: parsePositiveInt(groupCount),
              qualifiersPerGroup: parsePositiveInt(qualifiersPerGroup),
            }

    onGenerate(format, options)
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
          aria-labelledby="generate-bracket-title"
          className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-2xl"
        >
          <CardHeader className="pr-16">
            <CardTitle id="generate-bracket-title">Generar cuadro del torneo</CardTitle>
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

          <CardContent className="space-y-5">
            <Alert variant={notEnoughParticipants ? "warning" : "info"}>
              <AlertDescription>
                {notEnoughParticipants ? (
                  <>
                    Necesitas al menos {MIN_PARTICIPANTS} participantes confirmados para
                    generar el cuadro. Ahora mismo hay {confirmedCount}.
                  </>
                ) : (
                  <>
                    El cuadro se generará con{" "}
                    <strong>
                      {confirmedCount}{" "}
                      {confirmedCount === 1 ? "participante confirmado" : "participantes confirmados"}
                    </strong>
                    .
                    {pendingCount > 0 && (
                      <>
                        {" "}
                        {pendingCount}{" "}
                        {pendingCount === 1
                          ? "inscripción sin confirmar no se incluirá"
                          : "inscripciones sin confirmar no se incluirán"}
                        .
                      </>
                    )}
                    {hasCategories && " Se generará un cuadro por cada categoría."}
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="bracket-format">Formato</Label>
              <Select
                id="bracket-format"
                value={format}
                onChange={(event) => setFormat(event.target.value as BracketFormat)}
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

            {format === "single_elimination" && (
              <CheckboxRow
                checked={thirdPlace}
                onChange={setThirdPlace}
                label="Incluir partido por el 3.er y 4.º puesto"
              />
            )}

            {format === "round_robin" && (
              <CheckboxRow
                checked={doubleRound}
                onChange={setDoubleRound}
                label="Ida y vuelta (cada cruce se juega dos veces)"
              />
            )}

            {format === "groups_knockout" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bracket-groups">Número de grupos</Label>
                  <Input
                    id="bracket-groups"
                    type="number"
                    min={2}
                    inputMode="numeric"
                    placeholder="Automático"
                    value={groupCount}
                    onChange={(event) => setGroupCount(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bracket-qualifiers">Clasifican por grupo</Label>
                  <Input
                    id="bracket-qualifiers"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={qualifiersPerGroup}
                    onChange={(event) => setQualifiersPerGroup(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={busy || notEnoughParticipants}
              >
                {busy
                  ? "Generando..."
                  : hasExistingBracket
                    ? "Regenerar cuadro"
                    : "Generar cuadro"}
              </Button>
            </div>
          </CardContent>
        </Card>
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
