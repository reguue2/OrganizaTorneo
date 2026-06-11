-- Showing the organizer contact is now optional per tournament (default on).
-- Organizers who prefer not to expose their contact on a given tournament can
-- turn it off; the public RPC then returns nothing for that tournament.

ALTER TABLE "public"."tournaments"
  ADD COLUMN IF NOT EXISTS "show_organizer_contact" boolean NOT NULL DEFAULT true;

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
    AND t.show_organizer_contact = true
    AND t.status = ANY (ARRAY[
      'published'::public.tournament_status,
      'closed'::public.tournament_status,
      'finished'::public.tournament_status,
      'cancelled'::public.tournament_status
    ]);
$$;
