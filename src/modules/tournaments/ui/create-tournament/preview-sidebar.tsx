import { Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { getPaymentLabel } from "./display"
import type {
  CreateTournamentDraft,
  CreateTournamentPreviewItem,
} from "./types"

type CreateTournamentPreviewSidebarProps = {
  draft: CreateTournamentDraft
  posterName: string
  previewItems: CreateTournamentPreviewItem[]
}

function CreateTournamentPreviewSidebar({
  draft,
  posterName,
  previewItems,
}: CreateTournamentPreviewSidebarProps) {
  return (
    <aside className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="size-4" />
            Vista rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Torneo</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {draft.title || "Sin título"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={draft.is_public ? "success" : "outline"}>
              {draft.is_public ? "Público" : "Privado"}
            </Badge>
            <Badge variant="secondary">{getPaymentLabel(draft.payment_method)}</Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            {previewItems.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {posterName && (
            <>
              <Separator />
              <p className="truncate text-sm text-muted-foreground">
                Cartel: {posterName}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

export { CreateTournamentPreviewSidebar }
