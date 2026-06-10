"use client"

import Image from "next/image"
import { ImageIcon, Upload, X } from "lucide-react"
import { useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"

export function ManagementConfigPoster({
  disabled,
  fileName,
  onClear,
  onSelect,
  previewUrl,
}: {
  disabled: boolean
  fileName: string
  onClear: () => void
  onSelect: (file: File) => void
  previewUrl: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const selectFile = (file: File | undefined) => {
    if (file) onSelect(file)
  }

  const clearPoster = () => {
    if (inputRef.current) inputRef.current.value = ""
    onClear()
  }

  const dropPoster = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) selectFile(event.dataTransfer.files[0])
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={dropPoster}
      className={
        "overflow-hidden rounded-xl border border-dashed transition " +
        (dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20")
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          selectFile(event.target.files?.[0])
          event.currentTarget.value = ""
        }}
      />

      {previewUrl ? (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative aspect-[16/7] min-h-52 bg-muted">
            <Image
              key={previewUrl}
              src={previewUrl}
              alt="Vista previa del cartel"
              fill
              unoptimized
              className="object-contain"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-between gap-4 border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
            <div>
              <p className="font-medium text-foreground">
                {fileName ? "Nuevo cartel preparado" : "Cartel actual"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {fileName || "Puedes reemplazarlo o retirarlo."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="size-4" />
                Cambiar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={disabled}
                onClick={clearPoster}
              >
                <X className="size-4" />
                Quitar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-52 w-full flex-col items-center justify-center gap-3 p-8 text-center transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-xs">
            <ImageIcon className="size-5" />
          </span>
          <span>
            <span className="block font-medium text-foreground">Añadir cartel</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Haz clic o arrastra JPG, PNG, WebP o GIF. Máximo 5MB.
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
