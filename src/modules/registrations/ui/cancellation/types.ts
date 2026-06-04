import type { AppErrorCode } from "@/shared/api/errors"

export type CancelResult = {
  already_cancelled: boolean
  public_reference: string | null
  status: string | null
}

export type CancelErrorPayload = {
  error?: string
  code?: AppErrorCode
}

export type CancelFlowProps = {
  initialReference: string
  initialToken: string
  initialCode: string
}

export type FlowStatus = "idle" | "submitting" | "success" | "error"
