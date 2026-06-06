import {
  isManagementErrorCode,
  type ManagementErrorCode,
} from "@/modules/organizer/domain"

type ManagementActionResult =
  | { error: null; errorCode?: never }
  | { error: string; errorCode: ManagementErrorCode | null }

export async function requestManagementAction(
  path: string,
  body?: unknown,
  method: "POST" | "DELETE" = "POST"
): Promise<ManagementActionResult> {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.ok) {
    return { error: null }
  }

  try {
    const payload = (await response.json()) as { code?: unknown; error?: unknown }
    if (typeof payload.error === "string") {
      return {
        error: payload.error,
        errorCode: isManagementErrorCode(payload.code) ? payload.code : null,
      }
    }
  } catch {
    // The server should return JSON, but keep a stable UI error if it does not.
  }

  return { error: "No se pudo completar la operación.", errorCode: null }
}
