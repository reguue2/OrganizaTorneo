import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FormFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}

function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export { FormField }
