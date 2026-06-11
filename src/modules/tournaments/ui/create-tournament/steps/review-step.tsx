import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PublicPage } from "@/components/layout"
import type {
  PublicTournamentCategory,
  PublicTournamentDetail,
} from "@/modules/tournaments/domain"
import { PublicTournamentContent } from "@/modules/tournaments/ui/public-tournament/public-tournament-page"
import { parseIntegerInput, parseMoneyInput } from "@/shared/forms/numbers"

import type {
  CreateTournamentCategoryDraft,
  CreateTournamentDraft,
  CreateTournamentErrors,
  CreateTournamentPreviewItem,
  UpdateCreateTournamentDraftValue,
} from "../types"

type ReviewStepProps = {
  draft: CreateTournamentDraft
  errors: CreateTournamentErrors
  onDraftChange: UpdateCreateTournamentDraftValue
  posterName: string
  posterPreview: string | null
  previewItems: CreateTournamentPreviewItem[]
}

type PublicPreviewData = {
  categories: PublicTournamentCategory[]
  tournament: PublicTournamentDetail
}

function ReviewStep({ draft, errors, onDraftChange, posterPreview }: ReviewStepProps) {
  const preview = createPublicPreviewData(draft, posterPreview)

  return (
    <div className="space-y-6">
      <ContactStep draft={draft} errors={errors} onDraftChange={onDraftChange} />

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
    </div>
  )
}

function ContactStep({
  draft,
  errors,
  onDraftChange,
}: {
  draft: CreateTournamentDraft
  errors: CreateTournamentErrors
  onDraftChange: UpdateCreateTournamentDraftValue
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Contacto para participantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <label className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4">
          <span>
            <span className="block font-medium text-foreground">
              Mostrar mi contacto en la ficha del torneo
            </span>
          </span>
          <input
            type="checkbox"
            checked={draft.show_contact}
            onChange={(event) => onDraftChange("show_contact", event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-primary"
          />
        </label>

        {draft.show_contact && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="contact_name_input">Nombre o club</Label>
              <Input
                id="contact_name_input"
                value={draft.contact_name}
                onChange={(event) => onDraftChange("contact_name", event.target.value)}
                placeholder="Tu nombre o el de tu club"
                autoComplete="name"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive">{errors.contact_name}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact_whatsapp_input">WhatsApp</Label>
                <Input
                  id="contact_whatsapp_input"
                  type="tel"
                  value={draft.contact_whatsapp}
                  onChange={(event) => onDraftChange("contact_whatsapp", event.target.value)}
                  placeholder="+34 600 123 456"
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email_input">Email de contacto</Label>
                <Input
                  id="contact_email_input"
                  type="email"
                  value={draft.contact_email}
                  onChange={(event) => onDraftChange("contact_email", event.target.value)}
                  placeholder="contacto@tuclub.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
          </>
        )}
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
  return parseIntegerInput(value, { min: 1 })
}

function toNumber(value: string) {
  return parseMoneyInput(value) ?? 0
}

export { ReviewStep }
