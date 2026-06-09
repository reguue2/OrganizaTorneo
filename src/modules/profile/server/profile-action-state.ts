export type ProfileActionState = {
  status: "idle" | "success" | "error"
  message: string | null
}

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
  message: null,
}
