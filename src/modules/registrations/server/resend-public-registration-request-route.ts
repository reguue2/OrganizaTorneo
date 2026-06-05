import { NextResponse } from "next/server"
import { z } from "zod"
import { createApiErrorPayload } from "@/shared/api/errors"

import { resendPublicRegistrationRequestUseCase } from "./resend-public-registration-request-use-case"

const ResendSchema = z.object({
  requestId: z.string().uuid(),
})

export async function resendPublicRegistrationRequest(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      createApiErrorPayload("El cuerpo de la petición no es válido.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const parsed = ResendSchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json(
      createApiErrorPayload("Los datos del reenvío no son válidos.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const result = await resendPublicRegistrationRequestUseCase(parsed.data)
  return NextResponse.json(result.body, { status: result.status })
}
