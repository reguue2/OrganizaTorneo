import { NextResponse } from "next/server"
import { z } from "zod"
import { createApiErrorPayload } from "@/shared/api/errors"

import { createPublicRegistrationRequestUseCase } from "./create-public-registration-request-use-case"

const CreatePublicRegistrationRequestSchema = z.object({
  tournamentId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  displayName: z.string().trim().min(1),
  contactPhone: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  paymentMethod: z.enum(["cash", "online"]),
})

export async function createPublicRegistrationRequest(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      createApiErrorPayload("El cuerpo de la petición no es válido.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const parsed = CreatePublicRegistrationRequestSchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json(
      createApiErrorPayload("Los datos de la solicitud no son válidos.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const result = await createPublicRegistrationRequestUseCase(parsed.data, request)
  return NextResponse.json(result.body, { status: result.status })
}
