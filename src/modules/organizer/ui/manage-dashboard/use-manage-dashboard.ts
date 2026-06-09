import { useState } from "react"
import { useRouter } from "next/navigation"

import { toDateTimeLocal } from "./display"
import type { ConfigForm, ManageDashboardProps } from "./types"
import { useDashboardDerivedData } from "./use-dashboard-derived-data"
import { useManagementActions } from "./use-management-actions"

function createConfigForm({
  categories,
  tournament,
}: Pick<ManageDashboardProps, "categories" | "tournament">): ConfigForm {
  return {
    title: tournament.title,
    description: tournament.description ?? "",
    rules: tournament.rules ?? "",
    province: tournament.province ?? "",
    address: tournament.address ?? "",
    date: toDateTimeLocal(tournament.date),
    registration_deadline: toDateTimeLocal(tournament.registration_deadline),
    is_public: tournament.is_public ?? true,
    payment_method: tournament.payment_method ?? "cash",
    participant_type: tournament.participant_type,
    entry_price: String(tournament.entry_price ?? 0),
    max_participants:
      tournament.max_participants === null ? "" : String(tournament.max_participants),
    no_max_participants: tournament.max_participants === null,
    prize_mode: tournament.prize_mode,
    prizes: tournament.prizes ?? "",
    categories: categories.map((category) => ({
      key: category.id,
      id: category.id,
      name: category.name,
      participant_type: category.participant_type,
      price: String(category.price),
      max_participants:
        category.max_participants === null ? "" : String(category.max_participants),
      no_max_participants: category.max_participants === null,
      start_at: toDateTimeLocal(category.start_at),
      address: category.address ?? "",
      prizes: category.prizes ?? "",
    })),
  }
}

function useManageDashboard({
  brackets,
  categories,
  participants,
  payments,
  registrations,
  tournament,
}: ManageDashboardProps) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<
    "overview" | "participants" | "bracket" | "config"
  >("overview")
  const [busy, setBusy] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const [form, setForm] = useState<ConfigForm>(() =>
    createConfigForm({ categories, tournament })
  )

  const derivedData = useDashboardDerivedData({
    categories,
    participants,
    payments,
    registrations,
    tournament,
  })

  const refresh = () => {
    router.refresh()
  }

  const actions = useManagementActions({
    form,
    refresh,
    setBusy,
    setForm,
    setPageError,
    tournament,
  })

  return {
    activeTab,
    brackets,
    busy,
    form,
    pageError,
    setActiveTab,
    setForm,
    ...actions,
    ...derivedData,
  }
}

export type ManageDashboardViewModel = ReturnType<typeof useManageDashboard>

export { useManageDashboard }
