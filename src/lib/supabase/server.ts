import { createServerClient } from "@supabase/ssr"
import { getPublicEnv } from "@/config/env"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

type SupabaseCookieOptions = {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "lax" | "strict" | "none" | boolean
}

export async function createClient() {
  const cookieStore = await cookies()
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: SupabaseCookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: SupabaseCookieOptions) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    }
  )
}
