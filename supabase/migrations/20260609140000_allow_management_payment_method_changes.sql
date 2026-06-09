-- Payment method changes affect future registrations only. Existing requests,
-- registrations and payments keep the method stored on their own records.
DROP TRIGGER IF EXISTS "prevent_registration_config_change_on_tournaments"
ON "public"."tournaments";

CREATE TRIGGER "prevent_registration_config_change_on_tournaments"
BEFORE UPDATE OF "has_categories", "participant_type"
ON "public"."tournaments"
FOR EACH ROW
EXECUTE FUNCTION "public"."prevent_tournament_registration_config_change"();

ALTER FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) RENAME TO "update_tournament_management_settings_core";

CREATE OR REPLACE FUNCTION "public"."update_tournament_management_settings"(
  "p_tournament_id" "uuid",
  "p_title" "text",
  "p_description" "text",
  "p_rules" "text",
  "p_province" "text",
  "p_address" "text",
  "p_date" timestamp without time zone,
  "p_registration_deadline" timestamp without time zone,
  "p_is_public" boolean,
  "p_poster_url" "text",
  "p_payment_method" "public"."payment_method_enum",
  "p_participant_type" "public"."participant_type",
  "p_entry_price" numeric,
  "p_max_participants" integer,
  "p_prize_mode" "public"."prize_mode",
  "p_prizes" "text",
  "p_categories" "jsonb"
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_tournament public.tournaments%rowtype;
begin
  select *
  into v_tournament
  from public.tournaments
  where id = p_tournament_id;

  if not found then raise exception 'Tournament not found'; end if;

  if auth.uid() is null or auth.uid() <> v_tournament.organizer_id then
    raise exception 'You cannot manage this tournament';
  end if;

  if v_tournament.status not in (
    'published'::public.tournament_status,
    'closed'::public.tournament_status
  ) then
    raise exception 'Only published or closed tournaments can be edited from this panel';
  end if;

  if p_payment_method is null then raise exception 'Payment method is required'; end if;

  -- This update and the core call share one transaction, so any later validation
  -- failure rolls the payment method back as well.
  update public.tournaments
  set payment_method = p_payment_method
  where id = p_tournament_id;

  return public.update_tournament_management_settings_core(
    p_tournament_id,
    p_title,
    p_description,
    p_rules,
    p_province,
    p_address,
    p_date,
    p_registration_deadline,
    p_is_public,
    p_poster_url,
    p_payment_method,
    p_participant_type,
    p_entry_price,
    p_max_participants,
    p_prize_mode,
    p_prizes,
    p_categories
  );
end;
$$;

ALTER FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."update_tournament_management_settings_core"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) FROM PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) FROM PUBLIC, "anon";

GRANT EXECUTE ON FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) TO "authenticated";
