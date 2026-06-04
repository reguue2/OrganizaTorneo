"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, Share2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type ShareTournamentButtonProps = {
  path: string
  title: string
  variant?: "icon" | "full"
}

function ShareTournamentButton({
  path,
  title,
  variant = "full",
}: ShareTournamentButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return path
    return `${window.location.origin}${path}`
  }, [path])

  const shareText = `Mira este torneo: ${title}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  async function shareTournament() {
    const shareData: ShareData = {
      title,
      text: shareText,
      url: shareUrl,
    }

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onEscape)
    }
  }, [open])

  return (
    <>
      <Button
        type="button"
        variant={variant === "icon" ? "outline" : "secondary"}
        size={variant === "icon" ? "icon-lg" : "lg"}
        className={variant === "full" ? "w-full" : undefined}
        aria-label="Compartir torneo"
        title="Compartir torneo"
        onClick={shareTournament}
      >
        <Share2 className="size-4" />
        {variant === "full" && <span>Compartir torneo</span>}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/45"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Card
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="relative w-full max-w-md shadow-2xl"
            >
              <CardHeader className="pr-16">
                <CardTitle id="share-modal-title">Compartir torneo</CardTitle>
                <CardDescription>
                  Copia este enlace para enviarlo por el canal que prefieras.
                </CardDescription>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Cerrar"
                  title="Cerrar"
                  className="absolute right-4 top-4"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <Button
                    type="button"
                    size="lg"
                    aria-label="Copiar enlace"
                    title="Copiar enlace"
                    onClick={copyToClipboard}
                  >
                    <Copy className="size-4" />
                    Copiar
                  </Button>
                </div>

                <p
                  aria-live="polite"
                  className={
                    copied
                      ? "text-sm text-emerald-700"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {copied
                    ? "Enlace copiado al portapapeles."
                    : "El enlace apunta directamente a esta página pública."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  )
}

export { ShareTournamentButton }
