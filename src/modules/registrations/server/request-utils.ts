import type { Json } from "@/types/database"

export function resolveRequestOrigin(request: Request) {
  const explicitOrigin = request.headers.get("origin")
  if (explicitOrigin) return explicitOrigin

  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedHost = request.headers.get("x-forwarded-host")

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  const host = request.headers.get("host")
  if (host) {
    return `${forwardedProto ?? "https"}://${host}`
  }

  return new URL(request.url).origin
}

export function isJsonObject(
  value: Json | null
): value is Record<string, Json | undefined> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
