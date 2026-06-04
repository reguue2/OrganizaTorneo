import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type OrganizerPageProps = {
  children: ReactNode
  className?: string
  size?: "default" | "wide"
}

const organizerPageSizeClassName = {
  default: "max-w-7xl",
  wide: "max-w-[88rem]",
} as const

function OrganizerPage({
  children,
  className,
  size = "default",
}: OrganizerPageProps) {
  return (
    <div className={cn("py-6 md:py-8", className)}>
      <div
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          organizerPageSizeClassName[size]
        )}
      >
        {children}
      </div>
    </div>
  )
}

type OrganizerPageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  status?: ReactNode
  actions?: ReactNode
  className?: string
}

function OrganizerPageHeader({
  title,
  description,
  status,
  actions,
  className,
}: OrganizerPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {status}
        </div>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

type OrganizerSectionProps = {
  children: ReactNode
  className?: string
}

function OrganizerSection({ children, className }: OrganizerSectionProps) {
  return <section className={cn("space-y-4", className)}>{children}</section>
}

export { OrganizerPage, OrganizerPageHeader, OrganizerSection }
