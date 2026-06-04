"use client"

import { useState } from "react"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyTournamentLinkButton({
  path,
}: {
  path: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const origin = window.location.origin
      await navigator.clipboard.writeText(`${origin}${path}`)
      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      <Copy data-icon="inline-start" />
      {copied ? "Enlace copiado" : "Copiar enlace"}
    </Button>
  )
}
