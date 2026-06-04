import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PublicPageProps = {
  children: ReactNode
  className?: string
  size?: "default" | "narrow" | "wide"
}

const sizeClassName = {
  default: "max-w-7xl",
  narrow: "max-w-3xl",
  wide: "max-w-[88rem]",
} as const

function PublicPage({
  children,
  className,
  size = "default",
}: PublicPageProps) {
  return (
    <div className={cn("py-8 md:py-12", className)}>
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClassName[size])}>
        {children}
      </div>
    </div>
  )
}

type PublicPageHeaderProps = {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

function PublicPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PublicPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        {eyebrow && (
          <div className="mb-2 text-sm font-medium text-primary">{eyebrow}</div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export { PublicPage, PublicPageHeader }
