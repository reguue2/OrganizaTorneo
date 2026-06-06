import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
