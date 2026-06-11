import { serializeCreateTournamentCategories } from "./form-state"
import type { CreateTournamentDraft } from "./types"

type CreateTournamentHiddenFieldsProps = {
  draft: CreateTournamentDraft
}

function CreateTournamentHiddenFields({
  draft,
}: CreateTournamentHiddenFieldsProps) {
  return (
    <>
      <input type="hidden" name="title" value={draft.title} />
      <input type="hidden" name="description" value={draft.description} />
      <input type="hidden" name="province" value={draft.province} />
      <input type="hidden" name="address" value={draft.address} />
      <input type="hidden" name="date" value={draft.date} />
      <input
        type="hidden"
        name="registration_deadline"
        value={draft.registration_deadline}
      />
      <input type="hidden" name="is_public" value={String(draft.is_public)} />
      <input
        type="hidden"
        name="has_categories"
        value={String(draft.has_categories)}
      />
      <input
        type="hidden"
        name="participant_type"
        value={draft.has_categories ? "" : draft.participant_type ?? ""}
      />
      <input type="hidden" name="payment_method" value={draft.payment_method} />
      <input type="hidden" name="prize_mode" value={draft.prize_mode} />
      <input type="hidden" name="prizes" value={draft.prizes} />
      <input type="hidden" name="rules" value={draft.rules} />
      <input type="hidden" name="min_participants" value="1" />
      <input
        type="hidden"
        name="max_participants"
        value={draft.noMax ? "" : draft.max_participants}
      />
      <input
        type="hidden"
        name="entry_price"
        value={draft.has_categories ? "0" : draft.entry_price}
      />
      <input
        type="hidden"
        name="categories_json"
        value={serializeCreateTournamentCategories(draft)}
      />
      <input type="hidden" name="show_contact" value={String(draft.show_contact)} />
      <input type="hidden" name="contact_name" value={draft.contact_name} />
      <input type="hidden" name="contact_whatsapp" value={draft.contact_whatsapp} />
      <input type="hidden" name="contact_email" value={draft.contact_email} />
    </>
  )
}

export { CreateTournamentHiddenFields }
