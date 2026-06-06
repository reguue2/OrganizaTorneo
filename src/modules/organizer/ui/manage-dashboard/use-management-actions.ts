import type { TournamentRow } from "@/modules/organizer/domain"
import type { BracketFormat, BracketOptions } from "@/modules/tournaments/domain"

import {
  areRegistrationsClosed,
  canCancelFromDashboard,
  canReopenTournament,
  mapManagementError,
  needsCashValidation,
  needsOnlineValidation,
} from "./display"
import { requestManagementAction } from "./management-client"
import type { ConfigForm, RegistrationView } from "./types"

export function useManagementActions({
  form,
  refresh,
  setBusy,
  setPageError,
  tournament,
}: {
  form: ConfigForm
  refresh: () => void
  setBusy: (value: string | null) => void
  setPageError: (value: string | null) => void
  tournament: TournamentRow
}) {
  const updateTournamentStatus = async (
    nextStatus: "published" | "closed" | "cancelled"
  ) => {
    setPageError(null)

    if (nextStatus === "published" && !canReopenTournament(tournament)) {
      setPageError("No puedes reabrir inscripciones si la fecha límite ya ha pasado.")
      return
    }

    setBusy(`status:${nextStatus}`)

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/management/status`,
      { nextStatus }
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const saveConfig = async () => {
    setPageError(null)

    if (!form.title.trim()) {
      setPageError("El título es obligatorio.")
      return
    }

    if (tournament.status !== "published") {
      setPageError("Solo puedes editar la configuración mientras el torneo siga publicado.")
      return
    }

    setBusy("save-config")

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      rules: form.rules.trim() || undefined,
      province: form.province.trim() || undefined,
      address: form.address.trim() || undefined,
      date: form.date || undefined,
      registrationDeadline: form.registration_deadline || undefined,
      isPublic: form.is_public,
    }

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/management/config`,
      payload
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const confirmCashRegistration = async (view: RegistrationView) => {
    setPageError(null)

    if (!needsCashValidation(view, tournament)) {
      setPageError(
        "Solo puedes validar desde aquí inscripciones en efectivo pendientes de revisión."
      )
      return
    }

    setBusy(`paid:${view.registration.id}`)

    const result = await requestManagementAction(
      `/api/organizer/registrations/${view.registration.id}/cash-approval`
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const confirmOnlineRegistration = async (view: RegistrationView) => {
    setPageError(null)

    if (!needsOnlineValidation(view, tournament)) {
      setPageError("Solo puedes confirmar desde aquí inscripciones online que sigan pendientes.")
      return
    }

    setBusy(`online:${view.registration.id}`)

    const result = await requestManagementAction(
      `/api/organizer/registrations/${view.registration.id}/online-payment`
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const cancelRegistration = async (view: RegistrationView) => {
    setPageError(null)

    if (!canCancelFromDashboard(view.registration.status, tournament)) {
      setPageError(
        "Solo puedes cancelar desde este panel inscripciones que todavía no estén caducadas ni canceladas."
      )
      return
    }

    setBusy(`cancel:${view.registration.id}`)

    const result = await requestManagementAction(
      `/api/organizer/registrations/${view.registration.id}/cancellation`
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const generateBracket = async (
    format: BracketFormat,
    options: BracketOptions
  ) => {
    setPageError(null)

    if (!areRegistrationsClosed(tournament)) {
      setPageError("Cierra las inscripciones antes de generar el cuadro del torneo.")
      return
    }

    setBusy("bracket:generate")

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/bracket`,
      { format, options }
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const deleteBracket = async () => {
    setPageError(null)

    setBusy("bracket:delete")

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/bracket`,
      undefined,
      "DELETE"
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  return {
    cancelRegistration,
    confirmCashRegistration,
    confirmOnlineRegistration,
    deleteBracket,
    generateBracket,
    saveConfig,
    updateTournamentStatus,
  }
}
