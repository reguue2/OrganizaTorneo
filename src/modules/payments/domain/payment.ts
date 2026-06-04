export type PaymentChannel = "cash" | "online"
export type PaymentStatus = "pending" | "paid" | "refunded"

export type PaymentSummary = {
  amount: number
  currency: "EUR"
  channel: PaymentChannel
  status: PaymentStatus
}
