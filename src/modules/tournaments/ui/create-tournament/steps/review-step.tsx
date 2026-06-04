import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { getPrizeModeLabel } from "../display"
import type {
  CreateTournamentDraft,
  CreateTournamentPreviewItem,
} from "../types"

type ReviewStepProps = {
  draft: CreateTournamentDraft
  previewItems: CreateTournamentPreviewItem[]
}

function ReviewStep({ draft, previewItems }: ReviewStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisión final</CardTitle>
        <CardDescription>
          Comprueba los datos antes de crear y publicar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {previewItems.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-muted/40 p-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="size-4" />
                  {item.label}
                </div>
                <p className="mt-2 font-medium text-foreground">{item.value}</p>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Título</p>
            <p className="font-medium text-foreground">
              {draft.title || "Por definir"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ubicación</p>
            <p className="font-medium text-foreground">
              {draft.province || "Por definir"}
              {draft.address ? ` · ${draft.address}` : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Premios</p>
            <p className="font-medium text-foreground">
              {getPrizeModeLabel(draft.prize_mode)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ReviewStep }
