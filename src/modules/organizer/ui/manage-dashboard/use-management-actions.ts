import type { TournamentRow } from "@/modules/organizer/domain"
import type { MatchResult } from "@/modules/tournaments/domain"

import {
  areRegistrationsClosed,
  canCancelFromDashboard,
  canEditTournamentConfig,
  canReopenTournament,
  mapManagementError,
  needsCashValidation,
  needsOnlineValidation,
} from "./display"
import {
  requestManagementAction,
  requestManagementConfigUpdate,
} from "./management-client"
import type { BracketConfig, ConfigForm, RegistrationView, SaveNotice } from "./types"

export function useManagementActions({
  form,
  refresh,
  setBusy,
  setForm,
  setPageError,
  setSaveNotice,
  tournament,
}: {
  form: ConfigForm
  refresh: () => void
  setBusy: (value: string | null) => void
  setForm: React.Dispatch<React.SetStateAction<ConfigForm>>
  setPageError: (value: string | null) => void
  setSaveNotice: (value: SaveNotice | null) => void
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

  const saveConfig = async ({
    poster,
    posterAction,
  }: {
    poster: File | null
    posterAction: "keep" | "remove" | "replace"
  }) => {
    setPageError(null)
    setSaveNotice(null)

    const fail = (message: string) => {
      setSaveNotice({ message, variant: "destructive" })
      return false
    }

    if (!form.title.trim()) {
      return fail("El título es obligatorio.")
    }

    if (!canEditTournamentConfig(tournament)) {
      return fail("No puedes editar un torneo finalizado o cancelado.")
    }

    if (!form.province.trim() || !form.address.trim() || !form.date || !form.registration_deadline) {
      return fail("Completa provincia, dirección y fechas antes de guardar.")
    }

    const entryPrice = Number(form.entry_price)
    const maxParticipants = form.no_max_participants
      ? null
      : Number(form.max_participants)

    if (!Number.isFinite(entryPrice) || entryPrice < 0) {
      return fail("El precio de inscripción no es válido.")
    }

    if (
      maxParticipants !== null &&
      (!Number.isInteger(maxParticipants) || maxParticipants < 1)
    ) {
      return fail("Las plazas disponibles deben ser un número mayor que cero.")
    }

    if (form.prize_mode === "global" && !form.prizes.trim()) {
      return fail("Describe los premios globales antes de guardar.")
    }

    if (tournament.has_categories && form.categories.length === 0) {
      return fail("El torneo debe conservar al menos una categoría.")
    }

    const invalidCategory = form.categories.find((category) => {
      const price = Number(category.price)
      const capacity = category.no_max_participants
        ? null
        : Number(category.max_participants)

      return (
        !category.name.trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) ||
        (form.prize_mode === "per_category" && !category.prizes.trim())
      )
    })

    if (invalidCategory) {
      return fail(
        "Revisa el nombre, precio, plazas y premios de todas las categorías."
      )
    }

    setBusy("save-config")

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      rules: form.rules.trim() || undefined,
      province: form.province.trim(),
      address: form.address.trim(),
      date: form.date,
      registrationDeadline: form.registration_deadline,
      isPublic: form.is_public,
      showOrganizerContact: form.show_organizer_contact,
      paymentMethod: form.payment_method,
      participantType: form.participant_type,
      entryPrice,
      maxParticipants,
      prizeMode: form.prize_mode,
      prizes: form.prizes.trim() || undefined,
      posterAction,
      categories: form.categories.map((category) => ({
        id: category.id ?? category.key,
        isNew: category.id === null,
        name: category.name.trim(),
        participantType: category.participant_type,
        price: Number(category.price),
        maxParticipants: category.no_max_participants
          ? null
          : Number(category.max_participants),
        startAt: category.start_at || null,
        address: category.address.trim() || null,
        prizes: category.prizes.trim() || null,
      })),
    }

    const result = await requestManagementConfigUpdate(
      `/api/organizer/tournaments/${tournament.id}/management/config`,
      payload,
      poster
    )

    setBusy(null)

    if (result.error) {
      return fail(mapManagementError(result.error, result.errorCode))
    }

    setForm((previous) => ({
      ...previous,
      categories: previous.categories.map((category) =>
        category.id === null ? { ...category, id: category.key } : category
      ),
    }))
    setSaveNotice({
      message: "Cambios guardados correctamente.",
      variant: "success",
    })
    refresh()
    return true
  }

  const createManualRegistration = async (input: {
    displayName: string
    categoryId?: string
    contactPhone?: string
    contactEmail?: string
    markAsPaid: boolean
  }): Promise<{ ok: boolean; error?: string }> => {
    setPageError(null)
    setBusy("registration:create")

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/registrations`,
      {
        displayName: input.displayName,
        categoryId: input.categoryId,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        markAsPaid: input.markAsPaid,
      }
    )

    setBusy(null)

    if (result.error) {
      return { ok: false, error: mapManagementError(result.error, result.errorCode) }
    }

    refresh()
    return { ok: true }
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

  const generateBracket = async (configs: BracketConfig[]) => {
    setPageError(null)

    if (!areRegistrationsClosed(tournament)) {
      setPageError("Cierra las inscripciones antes de generar el cuadro del torneo.")
      return
    }

    if (configs.length === 0) {
      setPageError("Selecciona al menos una categoría para generar el cuadro.")
      return
    }

    setBusy("bracket:generate")

    const result = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/bracket`,
      { brackets: configs }
    )

    setBusy(null)

    if (result.error) {
      setPageError(mapManagementError(result.error, result.errorCode))
      return
    }

    refresh()
  }

  const saveMatchResult = async (
    bracketId: string,
    matchId: string,
    result: MatchResult | null
  ): Promise<{ ok: boolean; error?: string }> => {
    const response = await requestManagementAction(
      `/api/organizer/tournaments/${tournament.id}/bracket/results`,
      { bracketId, matchId, result },
      "PUT"
    )

    if (response.error) {
      // Surface the specific server message (the modal shows it inline) instead
      // of the generic mapped text, so the organizer sees the real reason.
      return { ok: false, error: response.error }
    }

    refresh()
    return { ok: true }
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
    createManualRegistration,
    deleteBracket,
    generateBracket,
    saveConfig,
    saveMatchResult,
    updateTournamentStatus,
  }
}
