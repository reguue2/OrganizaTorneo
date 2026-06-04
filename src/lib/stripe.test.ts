import { afterEach, describe, expect, it } from "vitest"

import { getStripeClient } from "./stripe"

const originalStripeSecretKey = process.env.STRIPE_SECRET_KEY
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

afterEach(() => {
  process.env.STRIPE_SECRET_KEY = originalStripeSecretKey
  process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey
})

describe("stripe client", () => {
  it("throws a clear error when the secret key is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key"
    delete process.env.STRIPE_SECRET_KEY

    expect(() => getStripeClient()).toThrow("Missing STRIPE_SECRET_KEY")
  })
})
