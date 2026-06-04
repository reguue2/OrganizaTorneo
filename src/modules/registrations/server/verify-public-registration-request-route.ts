import { NextResponse } from "next/server"
import { z } from "zod"
import { createApiErrorPayload } from "@/shared/api/errors"

import { verifyPublicRegistrationRequestUseCase } from "./verify-public-registration-request-use-case"

const VerifySchema = z
  .object({
    requestId: z.string().uuid(),
    verificationToken: z.string().trim().optional(),
    verificationCode: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.verificationToken && !value.verificationCode) {
      ctx.addIssue({
        code: "custom",
        message: "Debes enviar un token o un código de verificación.",
        path: ["verificationToken"],
      })
    }
  })

export async function verifyPublicRegistrationRequest(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      createApiErrorPayload("El cuerpo de la petición no es válido.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const parsed = VerifySchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json(
      createApiErrorPayload("Los datos de verificación no son válidos.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const result = await verifyPublicRegistrationRequestUseCase(parsed.data, request)
  return NextResponse.json(result.body, { status: result.status })
}
