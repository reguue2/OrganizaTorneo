"use client"

import { useState } from "react"
import { UserRound, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrganizerPage, OrganizerPageHeader } from "@/components/layout"
import type { OrganizerProfile, OrganizerWallet } from "@/modules/profile/domain"

import { ProfileContactForm } from "./profile-contact-form"
import { WalletTab } from "./wallet-tab"

export type ProfileTab = "perfil" | "monedero"

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: "perfil", label: "Perfil", icon: <UserRound data-icon="inline-start" /> },
  { id: "monedero", label: "Monedero", icon: <Wallet data-icon="inline-start" /> },
]

function tabButtonClassName(active: boolean): string {
  return active
    ? "relative rounded-none border-0 bg-transparent hover:bg-transparent after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
    : "rounded-none border-0 bg-transparent hover:bg-transparent"
}

export function ProfilePage({
  profile,
  wallet,
  initialTab = "perfil",
}: {
  profile: OrganizerProfile
  wallet: OrganizerWallet
  initialTab?: ProfileTab
}) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", tab)
      window.history.replaceState(null, "", url)
    }
  }

  return (
    <OrganizerPage>
      <OrganizerPageHeader
        title="Mi cuenta"
        description="Gestiona tu perfil de organizador y tu monedero."
      />

      <div
        aria-label="Secciones del perfil"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
        role="tablist"
      >
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            variant="ghost"
            className={tabButtonClassName(activeTab === tab.id)}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "perfil" ? (
        <ProfileContactForm profile={profile} />
      ) : (
        <WalletTab wallet={wallet} />
      )}
    </OrganizerPage>
  )
}
