"use client"

import { type FormEvent, useEffect, useState } from "react"
import { Trophy, X } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  deriveWinner,
  type BracketMatch,
  type BracketSlot,
  type MatchResult,
} from "@/modules/tournaments/domain"
import { parseIntegerInput } from "@/shared/forms/numbers"

export type SaveResultOutcome = { ok: boolean; error?: string }

function slotName(slot: BracketSlot): string {
  return slot.kind === "participant" ? slot.name : ""
}

function parseScore(value: string): number | null {
  return parseIntegerInput(value, { min: 0, max: 999 })
}

/**
 * Centered modal to register or edit a match result. The winner is derived from
 * the score; a tie that cannot end in a draw (knockout) asks the organizer to
 * pick who advances. The modal awaits the save and stays open showing the exact
 * error if it fails, so the organizer always sees what happened. `onSave(null)`
 * clears the result.
 */
export function MatchResultModal({
  match,
  allowDraw,
  onSave,
  onClose,
}: {
  match: BracketMatch
  allowDraw: boolean
  onSave: (result: MatchResult | null) => Promise<SaveResultOutcome>
  onClose: () => void
}) {
  const initial = match.result
  const [scoreA, setScoreA] = useState(
    initial && initial.scoreA !== null ? String(initial.scoreA) : ""
  )
  const [scoreB, setScoreB] = useState(
    initial && initial.scoreB !== null ? String(initial.scoreB) : ""
  )
  const [pick, setPick] = useState<"A" | "B" | null>(initial?.winner ?? null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const firstInput = document.getElementById("match-score-a") as HTMLInputElement | null
    firstInput?.focus()
    firstInput?.select()

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onEscape)
    }
  }, [onClose])

  const nameA = slotName(match.slotA)
  const nameB = slotName(match.slotB)

  const a = parseScore(scoreA)
  const b = parseScore(scoreB)
  const isTie = a !== null && b !== null && a === b
  const needsPick = isTie && !allowDraw

  const liveWinner: "A" | "B" | null = isTie
    ? allowDraw
      ? null
      : pick
    : deriveWinner(a, b)

  const canSave = a !== null && b !== null && (!isTie || allowDraw || pick !== null)

  async function submit(result: MatchResult | null) {
    if (saving) return
    setSaving(true)
    setErrorMessage(null)
    const outcome = await onSave(result)
    if (outcome.ok) {
      onClose()
      return
    }
    setSaving(false)
    setErrorMessage(outcome.error ?? "No se pudo guardar el resultado. Inténtalo de nuevo.")
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSave) return
    void submit({ scoreA: a, scoreB: b, winner: liveWinner })
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
          aria-labelledby="match-result-title"
          className="relative w-full max-w-sm shadow-2xl"
        >
          <CardHeader className="p-4 pr-14">
            <CardTitle id="match-result-title">Registrar resultado</CardTitle>
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

          <CardContent className="p-4 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <ContenderRow
                  inputId="match-score-a"
                  name={nameA}
                  value={scoreA}
                  highlight={liveWinner === "A"}
                  onChange={setScoreA}
                />
                <ContenderRow
                  name={nameB}
                  value={scoreB}
                  highlight={liveWinner === "B"}
                  onChange={setScoreB}
                />
              </div>

              {needsPick && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-foreground">¿Quién avanza?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <PickButton selected={pick === "A"} label={nameA} onClick={() => setPick("A")} />
                    <PickButton selected={pick === "B"} label={nameB} onClick={() => setPick("B")} />
                  </div>
                </div>
              )}

              <ResultSummary
                winner={liveWinner}
                isDraw={isTie && allowDraw}
                nameA={nameA}
                nameB={nameB}
              />

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2 pt-1">
                {initial && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={saving}
                    onClick={() => void submit(null)}
                  >
                    Borrar resultado
                  </Button>
                )}
                <div className="ml-auto flex gap-2">
                  <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!canSave || saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ContenderRow({
  inputId,
  name,
  value,
  highlight,
  onChange,
}: {
  inputId?: string
  name: string
  value: string
  highlight: boolean
  onChange: (value: string) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
        highlight ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          highlight ? "font-semibold text-foreground" : "text-foreground"
        )}
      >
        {name}
      </span>
      {highlight && <Trophy className="size-4 shrink-0 text-primary" />}
      <Input
        id={inputId}
        type="text"
        inputMode="numeric"
        maxLength={3}
        aria-label={`Puntuación de ${name}`}
        className="h-11 w-16 text-center text-lg font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function PickButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "truncate rounded-md border px-3 py-2 text-sm transition-colors",
        selected
          ? "border-primary bg-primary/10 font-medium text-foreground"
          : "border-border text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}

function ResultSummary({
  winner,
  isDraw,
  nameA,
  nameB,
}: {
  winner: "A" | "B" | null
  isDraw: boolean
  nameA: string
  nameB: string
}) {
  let message: string | null = null
  if (winner) {
    message = `Avanza ${winner === "A" ? nameA : nameB}`
  } else if (isDraw) {
    message = "Empate"
  }

  if (!message) return null

  return (
    <p className="rounded-md bg-muted/60 px-3 py-2 text-center text-sm text-foreground">
      {message}
    </p>
  )
}
