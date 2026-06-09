export type ManagementErrorCode =
  | "MANAGEMENT_ACTION_NOT_ALLOWED"
  | "MANAGEMENT_AUTH_REQUIRED"
  | "MANAGEMENT_FORBIDDEN"
  | "MANAGEMENT_REGISTRATION_FORBIDDEN"
  | "MANAGEMENT_REGISTRATION_INVALID"
  | "MANAGEMENT_TOURNAMENT_INVALID"
  | "MANAGEMENT_VALIDATION_ERROR"
  | "MANAGEMENT_REGISTRATION_DUPLICATE"
  | "MANAGEMENT_REGISTRATION_WINDOW_CLOSED"
  | "MANAGEMENT_CATEGORY_FULL"
  | "MANAGEMENT_TOURNAMENT_FULL"
  | "MANAGEMENT_CATEGORY_ADD_NOT_ALLOWED"
  | "MANAGEMENT_CATEGORY_DELETE_NOT_ALLOWED"
  | "MANAGEMENT_CATEGORY_CAPACITY_TOO_LOW"
  | "MANAGEMENT_REGISTRATION_CONFIG_LOCKED"
  | "MANAGEMENT_TOURNAMENT_CAPACITY_TOO_LOW"
  | "TOURNAMENT_CANCEL_NOT_ALLOWED"
  | "TOURNAMENT_CONFIG_NOT_ALLOWED"
  | "TOURNAMENT_FINISH_NOT_ALLOWED"
  | "TOURNAMENT_REOPEN_DEADLINE_PASSED"
  | "TOURNAMENT_REOPEN_NOT_ALLOWED"
  | "TOURNAMENT_STATUS_CASH_APPROVAL_NOT_ALLOWED"
  | "TOURNAMENT_STATUS_ONLINE_CONFIRMATION_NOT_ALLOWED"
  | "TOURNAMENT_STARTED"
  | "TOURNAMENT_TO_CLOSE_NOT_ALLOWED"
  | "REGISTRATION_CASH_APPROVAL_NOT_ALLOWED"
  | "REGISTRATION_CASH_NOT_PENDING"
  | "REGISTRATION_CANCEL_NOT_ALLOWED"
  | "REGISTRATION_EXPIRED"
  | "REGISTRATION_ONLINE_CONFIRMATION_NOT_ALLOWED"
  | "REGISTRATION_ONLINE_NOT_PENDING"

const managementErrorCodes = new Set<ManagementErrorCode>([
  "MANAGEMENT_ACTION_NOT_ALLOWED",
  "MANAGEMENT_AUTH_REQUIRED",
  "MANAGEMENT_FORBIDDEN",
  "MANAGEMENT_REGISTRATION_FORBIDDEN",
  "MANAGEMENT_REGISTRATION_INVALID",
  "MANAGEMENT_TOURNAMENT_INVALID",
  "MANAGEMENT_VALIDATION_ERROR",
  "MANAGEMENT_REGISTRATION_DUPLICATE",
  "MANAGEMENT_REGISTRATION_WINDOW_CLOSED",
  "MANAGEMENT_CATEGORY_FULL",
  "MANAGEMENT_TOURNAMENT_FULL",
  "MANAGEMENT_CATEGORY_ADD_NOT_ALLOWED",
  "MANAGEMENT_CATEGORY_DELETE_NOT_ALLOWED",
  "MANAGEMENT_CATEGORY_CAPACITY_TOO_LOW",
  "MANAGEMENT_REGISTRATION_CONFIG_LOCKED",
  "MANAGEMENT_TOURNAMENT_CAPACITY_TOO_LOW",
  "TOURNAMENT_CANCEL_NOT_ALLOWED",
  "TOURNAMENT_CONFIG_NOT_ALLOWED",
  "TOURNAMENT_FINISH_NOT_ALLOWED",
  "TOURNAMENT_REOPEN_DEADLINE_PASSED",
  "TOURNAMENT_REOPEN_NOT_ALLOWED",
  "TOURNAMENT_STATUS_CASH_APPROVAL_NOT_ALLOWED",
  "TOURNAMENT_STATUS_ONLINE_CONFIRMATION_NOT_ALLOWED",
  "TOURNAMENT_STARTED",
  "TOURNAMENT_TO_CLOSE_NOT_ALLOWED",
  "REGISTRATION_CASH_APPROVAL_NOT_ALLOWED",
  "REGISTRATION_CASH_NOT_PENDING",
  "REGISTRATION_CANCEL_NOT_ALLOWED",
  "REGISTRATION_EXPIRED",
  "REGISTRATION_ONLINE_CONFIRMATION_NOT_ALLOWED",
  "REGISTRATION_ONLINE_NOT_PENDING",
])

const managementErrorMatchers: Array<{
  code: ManagementErrorCode
  matches: readonly string[]
}> = [
  {
    code: "MANAGEMENT_FORBIDDEN",
    matches: ["You cannot manage this tournament"],
  },
  {
    code: "TOURNAMENT_REOPEN_NOT_ALLOWED",
    matches: ["Only closed tournaments can be reopened"],
  },
  {
    code: "TOURNAMENT_REOPEN_DEADLINE_PASSED",
    matches: ["Registration deadline already passed"],
  },
  {
    code: "TOURNAMENT_TO_CLOSE_NOT_ALLOWED",
    matches: ["Only published tournaments can be closed"],
  },
  {
    code: "TOURNAMENT_FINISH_NOT_ALLOWED",
    matches: ["Only published or closed tournaments can be finished"],
  },
  {
    code: "TOURNAMENT_CANCEL_NOT_ALLOWED",
    matches: ["Only published or closed tournaments can be cancelled"],
  },
  {
    code: "TOURNAMENT_CONFIG_NOT_ALLOWED",
    matches: [
      "Draft tournaments must be managed from the creation flow",
      "Only published tournaments can be edited from this panel",
      "Only published or closed tournaments can be edited from this panel",
    ],
  },
  {
    code: "MANAGEMENT_REGISTRATION_FORBIDDEN",
    matches: ["You cannot manage this registration"],
  },
  {
    code: "MANAGEMENT_REGISTRATION_DUPLICATE",
    matches: ["A registration already exists with this email or phone"],
  },
  {
    code: "MANAGEMENT_REGISTRATION_WINDOW_CLOSED",
    matches: ["Tournament status does not allow new registrations"],
  },
  {
    code: "MANAGEMENT_CATEGORY_FULL",
    matches: ["Category is full"],
  },
  {
    code: "MANAGEMENT_TOURNAMENT_FULL",
    matches: ["Tournament is full"],
  },
  {
    code: "MANAGEMENT_CATEGORY_ADD_NOT_ALLOWED",
    matches: ["Categories cannot be added after a bracket exists"],
  },
  {
    code: "MANAGEMENT_CATEGORY_DELETE_NOT_ALLOWED",
    matches: [
      "Category cannot be deleted after requests, registrations, or a bracket exist",
      "Category cannot be deleted after registrations or a bracket exist",
    ],
  },
  {
    code: "MANAGEMENT_CATEGORY_CAPACITY_TOO_LOW",
    matches: ["Category capacity cannot be lower than active registrations"],
  },
  {
    code: "MANAGEMENT_REGISTRATION_CONFIG_LOCKED",
    matches: [
      "Registration pricing and format cannot change after registrations exist",
      "Tournament registration config cannot change after requests or registrations exist",
      "Category registration config cannot change after requests or registrations exist",
      "Cannot change price after registrations exist",
      "Cannot change entry price after registrations exist",
    ],
  },
  {
    code: "MANAGEMENT_TOURNAMENT_CAPACITY_TOO_LOW",
    matches: ["Tournament capacity cannot be lower than active registrations"],
  },
  {
    code: "REGISTRATION_CASH_APPROVAL_NOT_ALLOWED",
    matches: ["Only cash registrations can be approved manually"],
  },
  {
    code: "REGISTRATION_CASH_NOT_PENDING",
    matches: ["Registration is not waiting for cash validation"],
  },
  {
    code: "REGISTRATION_ONLINE_CONFIRMATION_NOT_ALLOWED",
    matches: ["Only online registrations can be marked as paid manually"],
  },
  {
    code: "REGISTRATION_ONLINE_NOT_PENDING",
    matches: ["Only online pending registrations can be marked as paid"],
  },
  {
    code: "REGISTRATION_EXPIRED",
    matches: ["Expired registrations cannot be changed"],
  },
  {
    code: "TOURNAMENT_STARTED",
    matches: ["Tournament already started"],
  },
  {
    code: "TOURNAMENT_STATUS_CASH_APPROVAL_NOT_ALLOWED",
    matches: ["Tournament status does not allow cash approvals"],
  },
  {
    code: "TOURNAMENT_STATUS_ONLINE_CONFIRMATION_NOT_ALLOWED",
    matches: ["Tournament status does not allow online confirmations"],
  },
  {
    code: "REGISTRATION_CANCEL_NOT_ALLOWED",
    matches: ["Only registrations before tournament start can be cancelled"],
  },
]

export type ManagementErrorPayload = {
  error: string
  code: ManagementErrorCode
}

export function isManagementErrorCode(
  value: unknown
): value is ManagementErrorCode {
  return typeof value === "string" && managementErrorCodes.has(value as ManagementErrorCode)
}

export function getManagementErrorCode(message: string): ManagementErrorCode {
  return (
    managementErrorMatchers.find((item) =>
      item.matches.some((match) => message.includes(match))
    )?.code ?? "MANAGEMENT_ACTION_NOT_ALLOWED"
  )
}

export function createManagementErrorPayload(
  error: string,
  code: ManagementErrorCode = getManagementErrorCode(error)
): ManagementErrorPayload {
  return { error, code }
}
