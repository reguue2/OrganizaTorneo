"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Shows `text` truncated with an ellipsis when it is too wide for the cell, and
 * reveals the full value on demand: hover tooltip (`title`) on desktop and
 * tap-to-expand on touch devices. Short values render as plain, non-interactive
 * text.
 */
export function TruncatedText({
  className,
  maxWidthClassName = "max-w-[15rem]",
  text,
}: {
  className?: string
  maxWidthClassName?: string
  text: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      setOverflowing(element.scrollWidth > element.clientWidth + 1)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [text])

  const interactive = overflowing || expanded

  return (
    <button
      type="button"
      title={text}
      aria-expanded={interactive ? expanded : undefined}
      onClick={() => {
        if (interactive) setExpanded((value) => !value)
      }}
      className={cn(
        "mx-auto block max-w-full text-center",
        interactive ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <span
        ref={ref}
        className={cn(
          "block",
          expanded ? "whitespace-normal break-words" : cn("truncate", maxWidthClassName)
        )}
      >
        {text}
      </span>
    </button>
  )
}
