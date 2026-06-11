"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { normalizeWhatsappToInternational } from "@/modules/profile/domain"

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
  const whatsappInput = readString(formData, "whatsapp")
  const whatsapp = normalizeWhatsappToInternational(whatsappInput)
  const contactEmail = readString(formData, "contact_email")

  if (whatsappInput && !whatsapp) {
    return { status: "error", message: "Introduce un número de WhatsApp válido." }
  }

  const { error } = await supabase
    .from("users")
    .update({
      name: name || null,
      whatsapp: whatsapp || null,
      contact_email: contactEmail || null,
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
