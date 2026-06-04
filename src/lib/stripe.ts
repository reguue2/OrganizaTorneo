import Stripe from "stripe"
import { requireServerEnv } from "@/config/env"

let stripeClient: Stripe | null = null

export function getStripeClient() {
  const secretKey = requireServerEnv("STRIPE_SECRET_KEY")

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
  })

  return stripeClient
}
