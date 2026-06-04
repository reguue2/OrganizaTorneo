import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statToneClassName = {
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  indigo: "bg-indigo-50 text-indigo-700",
  sky: "bg-sky-50 text-sky-700",
  teal: "bg-teal-50 text-teal-700",
} as const

type StatTone = keyof typeof statToneClassName

export function StatCard({
  icon,
  title,
  tone,
  value,
}: {
  icon: ReactNode
  title: string
  tone: StatTone
  value: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-lg",
              statToneClassName[tone]
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SummaryTile({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <Card className="bg-muted/30 shadow-none">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-2 text-sm text-muted-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}

export function SectionBlock({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  description?: string
  title: string
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
