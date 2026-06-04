import type {
  RegistrationRow,
  TournamentRow,
  TournamentStatus,
} from "@/modules/organizer/domain"

import type { RegistrationView } from "./types"
import { needsOnlineValidation } from "./management-rules"

export function getStatusLabel(status: TournamentStatus | null) {
  if (status === "published") return "Publicado"
  if (status === "closed") return "Cerrado"
  if (status === "finished") return "Finalizado"
  if (status === "cancelled") return "Cancelado"
  return "No publicado"
}

export function getRegistrationStatusLabel(view: RegistrationView) {
  if (view.registration.status === "confirmed") {
    return "Confirmada"
  }

  if (view.registration.status === "pending_cash_validation") {
    return "Pendiente de validación en efectivo"
  }

  if (view.registration.status === "pending_online_payment") {
    return "Pendiente de pago online"
  }

  if (view.registration.status === "expired") return "Caducada"
  if (view.registration.status === "cancelled") return "Cancelada"
  if (view.registration.payment_method === "online") return "Pendiente de pago online"
  return "Pendiente"
}

export function getPaymentMethodLabel(method: RegistrationRow["payment_method"]) {
  if (method === "cash") return "Efectivo"
  if (method === "online") return "Online"
  return "Por definir"
}

export function getPaymentStatusLabel(
  view: RegistrationView,
  tournament: TournamentRow
) {
  if (view.payment?.status === "paid") return "Cobrado"
  if (view.payment?.status === "refunded") return "Reembolsado"
  if (view.payment?.status === "pending") return "Pendiente"
  if (needsOnlineValidation(view, tournament)) return "Pendiente de confirmar"
  return "Sin movimiento"
}
