import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOrganizerProfile, getOrganizerWallet } from "@/modules/profile/server"
import { ProfilePage, type ProfileTab } from "@/modules/profile/ui"

function resolveInitialTab(tab: string | undefined): ProfileTab {
  return tab === "monedero" ? "monedero" : "perfil"
}

export default async function PerfilRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login?next=/perfil")

  const { tab } = await searchParams

  const [profile, wallet] = await Promise.all([
    getOrganizerProfile(user.id, user.email ?? ""),
    getOrganizerWallet(user.id),
  ])

  return (
    <ProfilePage
      profile={profile}
      wallet={wallet}
      initialTab={resolveInitialTab(tab)}
    />
  )
}
