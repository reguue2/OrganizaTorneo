import { createClient } from "@supabase/supabase-js"
import { getPublicEnv, requireServerEnv } from "@/config/env"
import type { Database } from "@/types/database"

export function createAdminClient() {
  const { supabaseUrl } = getPublicEnv()
  const serviceRoleKey = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY")

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
