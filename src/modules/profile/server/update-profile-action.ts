"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

import type { ProfileActionState } from "./profile-action-state"

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function updateOrganizerProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: "error", message: "Debes iniciar sesión para editar tu perfil." }
  }

  const name = readString(formData, "name")
  const phone = readString(formData, "phone")
  const whatsapp = readString(formData, "whatsapp")
  const publicContact = formData.get("public_contact") === "on"

  const { error } = await supabase
    .from("users")
    .update({
      name: name || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      public_contact: publicContact,
    })
    .eq("id", user.id)

  if (error) {
    return {
      status: "error",
      message: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
    }
  }

  revalidatePath("/perfil")

  return { status: "success", message: "Perfil actualizado correctamente." }
}
