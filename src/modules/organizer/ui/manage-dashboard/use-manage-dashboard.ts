import { useState } from "react"
import { useRouter } from "next/navigation"

import { toDateTimeLocal } from "./display"
import type { ConfigForm, ManageDashboardProps } from "./types"
import { useDashboardDerivedData } from "./use-dashboard-derived-data"
import { useManagementActions } from "./use-management-actions"

function useManageDashboard({
  categories,
  participants,
  payments,
  registrations,
  tournament,
}: ManageDashboardProps) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"participants" | "config">("participants")
  const [busy, setBusy] = useState<string | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [copyOk, setCopyOk] = useState(false)

  const [form, setForm] = useState<ConfigForm>({
    title: tournament.title,
    description: tournament.description ?? "",
    rules: tournament.rules ?? "",
    province: tournament.province ?? "",
    address: tournament.address ?? "",
    date: toDateTimeLocal(tournament.date),
    registration_deadline: toDateTimeLocal(tournament.registration_deadline),
    is_public: tournament.is_public ?? true,
  })

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
    setPageError,
    tournament,
  })

  const copyPublicLink = async () => {
    try {
      const origin = window.location.origin
      await navigator.clipboard.writeText(`${origin}/torneos/${tournament.id}`)
      setCopyOk(true)
      window.setTimeout(() => setCopyOk(false), 1800)
    } catch {
      setCopyOk(false)
    }
  }

  return {
    activeTab,
    busy,
    copyOk,
    form,
    pageError,
    setActiveTab,
    setForm,
    copyPublicLink,
    ...actions,
    ...derivedData,
  }
}

export type ManageDashboardViewModel = ReturnType<typeof useManageDashboard>

export { useManageDashboard }
