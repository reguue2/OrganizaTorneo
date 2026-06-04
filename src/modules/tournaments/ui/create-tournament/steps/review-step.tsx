import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PublicPage } from "@/components/layout"
import type {
  PublicTournamentCategory,
  PublicTournamentDetail,
} from "@/modules/tournaments/domain"
import { PublicTournamentContent } from "@/modules/tournaments/ui/public-tournament/public-tournament-page"

import type {
  CreateTournamentCategoryDraft,
  CreateTournamentDraft,
  CreateTournamentPreviewItem,
} from "../types"

type ReviewStepProps = {
  draft: CreateTournamentDraft
  posterName: string
  posterPreview: string | null
  previewItems: CreateTournamentPreviewItem[]
}

type PublicPreviewData = {
  categories: PublicTournamentCategory[]
  tournament: PublicTournamentDetail
}

function ReviewStep({ draft, posterPreview }: ReviewStepProps) {
  const preview = createPublicPreviewData(draft, posterPreview)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle>Confirmar</CardTitle>
        <CardDescription>
          Revisa la página tal como la verán los participantes antes de publicarla.
        </CardDescription>
      </CardHeader>

      <CardContent className="bg-muted/30 p-3 sm:p-4">
        <div className="overflow-auto rounded-lg border border-border bg-background shadow-sm">
          <div className="min-w-max bg-background [zoom:0.4] sm:[zoom:0.58] md:[zoom:0.72] xl:[zoom:0.86]">
            <div className="w-[1180px]">
              <div className="pointer-events-none select-none">
                <PublicPage size="wide" className="py-6 md:py-8">
                  <PublicTournamentContent
                    tournament={preview.tournament}
                    categories={preview.categories}
                    showRegistrationSidebar={false}
                  />
                </PublicPage>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function createPublicPreviewData(
  draft: CreateTournamentDraft,
  posterPreview: string | null
): PublicPreviewData {
  const categories = draft.has_categories
    ? draft.categories.map(createPublicPreviewCategory)
    : []

  return {
    categories,
    tournament: {
      id: "preview",
      title: draft.title.trim() || "Nombre del torneo",
      description: toNullableText(draft.description),
      poster_url: posterPreview,
      prizes: draft.prize_mode === "global" ? toNullableText(draft.prizes) : null,
      rules: toNullableText(draft.rules),
      province: toNullableText(draft.province),
      address: toNullableText(draft.address),
      date: draft.date || null,
      max_participants: draft.noMax ? null : toNullableInteger(draft.max_participants),
      min_participants: 1,
      registration_deadline: draft.registration_deadline || null,
      payment_method: draft.payment_method,
      is_public: draft.is_public,
      status: "published",
      has_categories: draft.has_categories,
      prize_mode: draft.prize_mode,
      entry_price: toNumber(draft.entry_price),
    },
  }
}

function createPublicPreviewCategory(
  category: CreateTournamentCategoryDraft
): PublicTournamentCategory {
  return {
    id: category.id,
    name: category.name.trim() || "Categoría sin nombre",
    price: toNumber(category.price),
    min_participants: 1,
    max_participants: category.noMax
      ? null
      : toNullableInteger(category.max_participants),
    start_at: category.hasCustomDate ? category.start_at || null : null,
    address: category.hasCustomAddress ? toNullableText(category.address) : null,
    prizes: toNullableText(category.prizes),
  }
}

function toNullableText(value: string) {
  const text = value.trim()
  return text ? text : null
}

function toNullableInteger(value: string) {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) return null
  return number
}

function toNumber(value: string) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) return 0
  return number
}

export { ReviewStep }
