-- Manual registrations created by the organizer from the management dashboard.
--
-- Unlike the public registration flow (which requires email verification), the
-- organizer can add a participant directly. Only the participant name is
-- mandatory; phone and email are optional. The organizer chooses whether the
-- registration is already paid (confirmed) or still pending cash collection,
-- and may add entries while the tournament is published OR closed.

-- 1) Let the insert trigger skip the "registration window" checks (open status
--    + deadline) when a trusted server-side function opts in via a
--    transaction-local flag. Category-linkage and capacity checks still apply.
CREATE OR REPLACE FUNCTION "public"."check_registration_rules"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  current_count integer;
  max_allowed integer;
  deadline timestamp;
  tourn_status public.tournament_status;
  v_has_categories boolean;
  v_category_tournament_id uuid;
  v_bypass_window boolean;
begin
  if new.tournament_id is null then
    raise exception 'Tournament is required';
  end if;

  v_bypass_window :=
    coalesce(current_setting('app.bypass_registration_window', true), 'off') = 'on';

  select t.status, t.registration_deadline, t.has_categories
  into tourn_status, deadline, v_has_categories
  from public.tournaments t
  where t.id = new.tournament_id;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if new.category_id is not null then
    select c.tournament_id
    into v_category_tournament_id
    from public.categories c
    where c.id = new.category_id;

    if v_category_tournament_id is null then
      raise exception 'Category not linked to tournament';
    end if;

    if v_category_tournament_id <> new.tournament_id then
      raise exception 'Category not linked to tournament';
    end if;
  end if;

  if v_has_categories and new.category_id is null then
    raise exception 'Category is required';
  end if;

  if not v_has_categories and new.category_id is not null then
    raise exception 'Category is not allowed for this tournament';
  end if;

  if not v_bypass_window then
    if tourn_status <> 'published' then
      raise exception 'Tournament is not open for registration';
    end if;

    if deadline is not null and now() > deadline then
      raise exception 'Registration deadline passed';
    end if;
  end if;

  if new.category_id is not null then
    select count(*) into current_count
    from public.registrations r
    where r.category_id = new.category_id
      and r.status not in ('cancelled', 'expired');

    select c.max_participants into max_allowed
    from public.categories c
    where c.id = new.category_id;

    if max_allowed is not null and current_count >= max_allowed then
      raise exception 'Category is full';
    end if;
  else
    select count(*) into current_count
    from public.registrations r
    where r.tournament_id = new.tournament_id
      and r.category_id is null
      and r.status not in ('cancelled', 'expired');

    select t.max_participants into max_allowed
    from public.tournaments t
    where t.id = new.tournament_id;

    if max_allowed is not null and current_count >= max_allowed then
      raise exception 'Tournament is full';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."check_registration_rules"() OWNER TO "postgres";


-- 2) Create a confirmed (or pending) registration on behalf of the organizer.
CREATE OR REPLACE FUNCTION "public"."create_manual_registration"("p_tournament_id" "uuid", "p_display_name" "text", "p_category_id" "uuid" DEFAULT NULL::"uuid", "p_contact_phone" "text" DEFAULT NULL::"text", "p_contact_email" "text" DEFAULT NULL::"text", "p_mark_as_paid" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_tournament public.tournaments%rowtype;
  v_category public.categories%rowtype;
  v_display_name text;
  v_phone_raw text;
  v_phone_normalized text;
  v_email_raw text;
  v_email_normalized text;
  v_participant_type public.participant_type;
  v_amount numeric;
  v_participant_id uuid;
  v_registration_id uuid;
  v_public_reference text;
  v_status public.registration_status;
  v_payment_status public.payment_status;
  v_cancel_code text;
  v_cancel_token text;
begin
  v_display_name := trim(coalesce(p_display_name, ''));
  if v_display_name = '' then
    raise exception 'Display name is required';
  end if;

  select *
  into v_tournament
  from public.tournaments
  where id = p_tournament_id;

  if not found then
    raise exception 'Tournament not found';
  end if;

  if auth.uid() is null or auth.uid() <> v_tournament.organizer_id then
    raise exception 'You cannot manage this tournament';
  end if;

  if v_tournament.status not in (
    'published'::public.tournament_status,
    'closed'::public.tournament_status
  ) then
    raise exception 'Tournament status does not allow new registrations';
  end if;

  if v_tournament.has_categories then
    if p_category_id is null then
      raise exception 'Category is required';
    end if;

    select *
    into v_category
    from public.categories
    where id = p_category_id
      and tournament_id = p_tournament_id;

    if not found then
      raise exception 'Category not linked to tournament';
    end if;

    v_participant_type := v_category.participant_type;
    v_amount := coalesce(v_category.price, 0);
  else
    if p_category_id is not null then
      raise exception 'Category is not allowed for this tournament';
    end if;

    if v_tournament.participant_type is null then
      raise exception 'Tournament participant type is not configured';
    end if;

    v_participant_type := v_tournament.participant_type;
    v_amount := coalesce(v_tournament.entry_price, 0);
  end if;

  v_phone_raw := nullif(trim(coalesce(p_contact_phone, '')), '');
  v_phone_normalized := case
    when v_phone_raw is not null then public.normalize_spanish_phone(v_phone_raw)
    else null
  end;

  v_email_raw := nullif(trim(coalesce(p_contact_email, '')), '');
  v_email_normalized := case
    when v_email_raw is not null then public.normalize_email(v_email_raw)
    else null
  end;

  if (v_email_normalized is not null or v_phone_normalized is not null) and exists (
    select 1
    from public.registrations r
    where r.tournament_id = p_tournament_id
      and r.category_id is not distinct from p_category_id
      and r.status not in ('cancelled', 'expired')
      and (
        (v_email_normalized is not null and r.contact_email_normalized = v_email_normalized)
        or (v_phone_normalized is not null and r.contact_phone_normalized = v_phone_normalized)
      )
  ) then
    raise exception 'A registration already exists with this email or phone';
  end if;

  if coalesce(v_amount, 0) <= 0 or coalesce(p_mark_as_paid, true) then
    v_status := 'confirmed'::public.registration_status;
    v_payment_status := 'paid'::public.payment_status;
  else
    v_status := 'pending_cash_validation'::public.registration_status;
    v_payment_status := 'pending'::public.payment_status;
  end if;

  insert into public.participants (
    type,
    display_name,
    contact_phone,
    contact_email,
    players
  )
  values (
    v_participant_type,
    v_display_name,
    coalesce(v_phone_raw, ''),
    v_email_raw,
    null
  )
  returning id into v_participant_id;

  v_public_reference := public.generate_public_reference();
  v_cancel_code := lpad(((random() * 999999)::int)::text, 6, '0');
  v_cancel_token := encode(extensions.gen_random_bytes(24), 'hex');

  -- Manual organizer entries are allowed even with registrations closed.
  perform set_config('app.bypass_registration_window', 'on', true);

  insert into public.registrations (
    tournament_id,
    category_id,
    participant_id,
    status,
    payment_method,
    public_reference,
    contact_email_normalized,
    contact_phone_normalized,
    cancel_code_hash,
    cancel_token_hash,
    cancelled_at
  )
  values (
    p_tournament_id,
    p_category_id,
    v_participant_id,
    v_status,
    'cash'::public.registration_payment_method,
    v_public_reference,
    v_email_normalized,
    v_phone_normalized,
    extensions.crypt(v_cancel_code, extensions.gen_salt('bf')),
    public.sha256_hex(v_cancel_token),
    null
  )
  returning id into v_registration_id;

  perform set_config('app.bypass_registration_window', 'off', true);

  update public.participants
  set source_registration_id = v_registration_id
  where id = v_participant_id;

  insert into public.payments (
    registration_id,
    amount,
    payment_method,
    status,
    paid_at
  )
  values (
    v_registration_id,
    coalesce(v_amount, 0),
    'cash'::public.registration_payment_method,
    v_payment_status,
    case when v_payment_status = 'paid'::public.payment_status then now() else null end
  );

  return jsonb_build_object(
    'registration_id', v_registration_id,
    'public_reference', v_public_reference,
    'status', v_status,
    'payment_status', v_payment_status,
    'amount', coalesce(v_amount, 0)
  );
end;
$$;


ALTER FUNCTION "public"."create_manual_registration"("p_tournament_id" "uuid", "p_display_name" "text", "p_category_id" "uuid", "p_contact_phone" "text", "p_contact_email" "text", "p_mark_as_paid" boolean) OWNER TO "postgres";


GRANT ALL ON FUNCTION "public"."create_manual_registration"("p_tournament_id" "uuid", "p_display_name" "text", "p_category_id" "uuid", "p_contact_phone" "text", "p_contact_email" "text", "p_mark_as_paid" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_manual_registration"("p_tournament_id" "uuid", "p_display_name" "text", "p_category_id" "uuid", "p_contact_phone" "text", "p_contact_email" "text", "p_mark_as_paid" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_manual_registration"("p_tournament_id" "uuid", "p_display_name" "text", "p_category_id" "uuid", "p_contact_phone" "text", "p_contact_email" "text", "p_mark_as_paid" boolean) TO "service_role";
