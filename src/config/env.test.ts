import { describe, expect, it } from "vitest"

import { getPublicEnv, getServerEnv, requireServerEnv } from "./env"

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
}

describe("env config", () => {
  it("parses public Supabase config", () => {
    expect(getPublicEnv(baseEnv)).toEqual({
      supabaseUrl: "http://127.0.0.1:54321",
      supabaseAnonKey: "anon-key",
    })
  })

  it("fails when public Supabase config is missing", () => {
    expect(() => getPublicEnv({})).toThrow(
      "Invalid environment configuration: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  })

  it("keeps server secrets optional until explicitly required", () => {
    expect(getServerEnv(baseEnv)).toMatchObject({
      supabaseServiceRoleKey: undefined,
      stripeSecretKey: undefined,
      cronSecret: undefined,
      registrationEmailProvider: "resend",
    })
  })

  it("throws a clear error when a required server secret is missing", () => {
    expect(() => requireServerEnv("STRIPE_SECRET_KEY", baseEnv)).toThrow(
      "Missing STRIPE_SECRET_KEY"
    )
  })
})
