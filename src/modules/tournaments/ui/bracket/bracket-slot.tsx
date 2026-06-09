import type { BracketSlot } from "@/modules/tournaments/domain"
import { cn } from "@/lib/utils"

export function SlotLabel({
  slot,
  className,
}: {
  slot: BracketSlot
  className?: string
}) {
  if (slot.kind === "participant") {
    return (
      <span className={cn("block min-w-0 truncate font-medium text-foreground", className)}>
        {slot.name}
      </span>
    )
  }

  if (slot.kind === "bye") {
    return (
      <span className={cn("block min-w-0 truncate italic text-muted-foreground", className)}>
        Libre
      </span>
    )
  }

  return (
    <span className={cn("block min-w-0 truncate text-muted-foreground", className)}>
      {slot.label}
    </span>
  )
}
