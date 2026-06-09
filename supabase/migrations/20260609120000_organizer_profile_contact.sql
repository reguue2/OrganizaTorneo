-- Organizer public contact details for local tournaments.
-- Participants frequently need to reach the organizer to pay or ask
-- questions, so we let organizers expose a WhatsApp / phone / email on
-- their public tournament pages, gated by an explicit opt-in flag.
ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "whatsapp" "text",
  ADD COLUMN IF NOT EXISTS "public_contact" boolean NOT NULL DEFAULT false;

-- Returns the organizer's public contact for a visible tournament, and only
-- when the organizer opted in. SECURITY DEFINER so anonymous visitors can read
-- it without a broad SELECT policy exposing the whole users table.
CREATE OR REPLACE FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid")
  RETURNS TABLE("name" "text", "email" "text", "phone" "text", "whatsapp" "text")
  LANGUAGE "sql"
  SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
  SELECT u.name, u.email, u.phone, u.whatsapp
  FROM public.tournaments t
  JOIN public.users u ON u.id = t.organizer_id
  WHERE t.id = p_tournament_id
    AND t.status = ANY (ARRAY[
      'published'::public.tournament_status,
      'closed'::public.tournament_status,
      'finished'::public.tournament_status,
      'cancelled'::public.tournament_status
    ])
    AND u.public_contact = true;
$$;

ALTER FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") OWNER TO "postgres";

GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_public_organizer_contact"("p_tournament_id" "uuid") TO "service_role";
