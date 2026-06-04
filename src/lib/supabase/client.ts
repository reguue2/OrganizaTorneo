import { createBrowserClient } from "@supabase/ssr"
import { getPublicEnv } from "@/config/env"
import type { Database } from "@/types/database"

export const createClient = () => {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv()

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
