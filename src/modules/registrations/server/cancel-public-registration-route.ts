import { NextResponse } from "next/server"
import { z } from "zod"

import { createApiErrorPayload } from "@/shared/api/errors"

import { cancelPublicRegistrationUseCase } from "./cancel-public-registration-use-case"

const CancelPublicRegistrationSchema = z
  .object({
    publicReference: z.string().trim().min(1),
    cancelToken: z.string().trim().optional(),
    cancelCode: z.string().trim().regex(/^\d{6}$/).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.cancelToken && !value.cancelCode) {
      ctx.addIssue({
        code: "custom",
        message: "Debes enviar un token o un código de cancelación.",
        path: ["cancelToken"],
      })
    }
  })

export async function cancelPublicRegistration(request: Request) {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json(
      createApiErrorPayload("El cuerpo de la petición no es válido.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const parsed = CancelPublicRegistrationSchema.safeParse(rawBody)

  if (!parsed.success) {
    return NextResponse.json(
      createApiErrorPayload("Los datos de cancelación no son válidos.", "VALIDATION_ERROR"),
      { status: 400 }
    )
  }

  const result = await cancelPublicRegistrationUseCase(parsed.data)
  return NextResponse.json(result.body, { status: result.status })
}
