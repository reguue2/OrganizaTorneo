import { z } from "zod"

const optionalSecret = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
)

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
})

const ServerEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  STRIPE_SECRET_KEY: optionalSecret,
  CRON_SECRET: optionalSecret,
  REGISTRATION_EMAIL_PROVIDER: z
    .string()
    .trim()
    .min(1)
    .default("resend")
    .transform((value) => value.toLowerCase()),
  RESEND_API_KEY: optionalSecret,
  REGISTRATION_EMAIL_FROM: optionalSecret,
  REGISTRATION_EMAIL_REPLY_TO: optionalSecret,
  REGISTRATION_SUPPORT_EMAIL: optionalSecret,
})

type EnvSource = Record<string, string | undefined>
type ServerSecretName = "SUPABASE_SERVICE_ROLE_KEY" | "STRIPE_SECRET_KEY"

function readPublicEnvSource(): EnvSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

function parseEnv<T>(schema: z.ZodType<T>, source: EnvSource) {
  const result = schema.safeParse(source)

  if (!result.success) {
    const variables = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ")

    throw new Error(
      variables
        ? `Invalid environment configuration: ${variables}`
        : "Invalid environment configuration"
    )
  }

  return result.data
}

export function getPublicEnv(source: EnvSource = readPublicEnvSource()) {
  const env = parseEnv(PublicEnvSchema, source)

  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
}

export function getServerEnv(source: EnvSource = process.env) {
  if (typeof window !== "undefined") {
    throw new Error("Server environment variables cannot be read in the browser")
  }

  const env = parseEnv(ServerEnvSchema, source)

  return {
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    cronSecret: env.CRON_SECRET,
    registrationEmailProvider: env.REGISTRATION_EMAIL_PROVIDER,
    resendApiKey: env.RESEND_API_KEY,
    registrationEmailFrom:
      env.REGISTRATION_EMAIL_FROM ?? "Organiza Torneo <integrowagency@gmail.com>",
    registrationEmailReplyTo:
      env.REGISTRATION_EMAIL_REPLY_TO ?? env.REGISTRATION_SUPPORT_EMAIL,
    registrationSupportEmail:
      env.REGISTRATION_SUPPORT_EMAIL ?? "integrowagency@gmail.com",
  }
}

export function requireServerEnv(
  name: ServerSecretName,
  source: EnvSource = process.env
) {
  const env = getServerEnv(source)
  const value =
    name === "SUPABASE_SERVICE_ROLE_KEY"
      ? env.supabaseServiceRoleKey
      : env.stripeSecretKey

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}
