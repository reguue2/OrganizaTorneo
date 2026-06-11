-- Organizer public contact, take 2. Local tournaments require the organizer to
-- be reachable, so the contact is now shown on every visible tournament instead
-- of behind an opt-in. To respect data minimisation we expose a dedicated
-- `contact_email` (never the login email) and drop the `public_contact` gate.

ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "contact_email" "text";

-- Returns the organizer's public contact for a visible tournament: name, the
-- dedicated contact email and WhatsApp. No login email, no phone, no opt-in
-- gate. SECURITY DEFINER so anonymous visitors can read it without a broad
-- SELECT policy exposing the whole users table.
-- Dropped first because the return type (OUT columns) changes.
DROP FUNCTION IF EXISTS "public"."get_public_organizer_contact"("uuid");

CREATE OR REPLACE FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid")
  RETURNS TABLE("name" "text", "contact_email" "text", "whatsapp" "text")
  LANGUAGE "sql"
  SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
  SELECT u.name, u.contact_email, u.whatsapp
  FROM public.tournaments t
  JOIN public.users u ON u.id = t.organizer_id
  WHERE t.id = p_tournament_id
    AND t.status = ANY (ARRAY[
      'published'::public.tournament_status,
      'closed'::public.tournament_status,
      'finished'::public.tournament_status,
      'cancelled'::public.tournament_status
    ]);
$$;

ALTER FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "service_role";

-- The opt-in flag is gone: contact is required to publish and always shown.
ALTER TABLE "public"."users"
  DROP COLUMN IF EXISTS "public_contact";
