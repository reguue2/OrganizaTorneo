"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

import type { BracketMatch, MatchResult } from "@/modules/tournaments/domain"

import { MatchResultModal, type SaveResultOutcome } from "./match-result-modal"

export type BracketResultsContextValue = {
  /** When false the bracket is read-only (public view). */
  canEdit: boolean
  /** Id of the match whose result is currently being saved, if any. */
  savingMatchId: string | null
  /** Opens the result modal for a match. `allowDraw` is true for leagues. */
  requestEdit: (match: BracketMatch, allowDraw: boolean) => void
}

const READ_ONLY: BracketResultsContextValue = {
  canEdit: false,
  savingMatchId: null,
  requestEdit: () => {},
}

const BracketResultsContext = createContext<BracketResultsContextValue>(READ_ONLY)

type EditingMatch = { match: BracketMatch; allowDraw: boolean }

/**
 * Makes a bracket editable: match cards open a single centered modal to register
 * results. Without this provider the bracket is read-only (the public view).
 */
export function BracketResultsProvider({
  canEdit,
  savingMatchId,
  onSaveResult,
  children,
}: {
  canEdit: boolean
  savingMatchId: string | null
  onSaveResult: (matchId: string, result: MatchResult | null) => Promise<SaveResultOutcome>
  children: ReactNode
}) {
  const [editing, setEditing] = useState<EditingMatch | null>(null)

  const value: BracketResultsContextValue = {
    canEdit,
    savingMatchId,
    requestEdit: (match, allowDraw) => setEditing({ match, allowDraw }),
  }

  return (
    <BracketResultsContext.Provider value={value}>
      {children}
      {editing && (
        <MatchResultModal
          match={editing.match}
          allowDraw={editing.allowDraw}
          onSave={(result) => onSaveResult(editing.match.id, result)}
          onClose={() => setEditing(null)}
        />
      )}
    </BracketResultsContext.Provider>
  )
}

export function useBracketResults() {
  return useContext(BracketResultsContext)
}
