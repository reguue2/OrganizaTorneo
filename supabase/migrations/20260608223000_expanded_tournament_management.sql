-- Expanded tournament management editor with guarded structural changes.
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
  v_category public.categories%rowtype;
  v_category_input jsonb;
  v_category_id uuid;
  v_category_is_new boolean;
  v_category_name text;
  v_category_type public.participant_type;
  v_category_price numeric;
  v_category_max integer;
  v_category_start timestamp;
  v_category_address text;
  v_category_prizes text;
  v_registration_count integer;
  v_active_count integer;
  v_has_brackets boolean;
  v_title text;
  v_province text;
  v_address text;
  v_description text;
  v_rules text;
  v_prizes text;
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

  v_title := trim(coalesce(p_title, ''));
  v_province := trim(coalesce(p_province, ''));
  v_address := trim(coalesce(p_address, ''));
  v_description := nullif(trim(coalesce(p_description, '')), '');
  v_rules := nullif(trim(coalesce(p_rules, '')), '');
  v_prizes := nullif(trim(coalesce(p_prizes, '')), '');

  if v_title = '' then raise exception 'Title is required'; end if;
  if v_province = '' then raise exception 'Province is required'; end if;
  if v_address = '' then raise exception 'Address is required'; end if;
  if p_date is null then raise exception 'Tournament date is required'; end if;
  if p_registration_deadline is null then
    raise exception 'Registration deadline is required';
  end if;
  if p_registration_deadline > p_date then
    raise exception 'Registration deadline cannot be after tournament date';
  end if;
  if p_payment_method is null then raise exception 'Payment method is required'; end if;
  if p_prize_mode is null then raise exception 'Prize mode is required'; end if;
  if p_prize_mode = 'global'::public.prize_mode and v_prizes is null then
    raise exception 'Global prizes are required';
  end if;
  if p_prize_mode = 'per_category'::public.prize_mode and not v_tournament.has_categories then
    raise exception 'Per-category prizes require categories';
  end if;

  select count(*),
    count(*) filter (
      where status not in (
        'cancelled'::public.registration_status,
        'expired'::public.registration_status
      )
    )
  into v_registration_count, v_active_count
  from public.registrations
  where tournament_id = v_tournament.id;

  if v_registration_count > 0
     and p_payment_method is distinct from v_tournament.payment_method then
    raise exception 'Registration pricing and format cannot change after registrations exist';
  end if;

  if not v_tournament.has_categories then
    if p_participant_type is null then
      raise exception 'Tournament participant type is required';
    end if;
    if p_entry_price is null or p_entry_price < 0 then
      raise exception 'Tournament entry price is invalid';
    end if;
    if p_max_participants is not null and p_max_participants < 1 then
      raise exception 'Tournament max participants are invalid';
    end if;
    if p_max_participants is not null and p_max_participants < v_active_count then
      raise exception 'Tournament capacity cannot be lower than active registrations';
    end if;
    if v_registration_count > 0 and (
      p_participant_type is distinct from v_tournament.participant_type
      or p_entry_price is distinct from v_tournament.entry_price
    ) then
      raise exception 'Registration pricing and format cannot change after registrations exist';
    end if;

    update public.tournaments
    set
      title = v_title,
      description = v_description,
      rules = v_rules,
      province = v_province,
      address = v_address,
      date = p_date,
      registration_deadline = p_registration_deadline,
      is_public = coalesce(p_is_public, true),
      poster_url = nullif(trim(coalesce(p_poster_url, '')), ''),
      payment_method = p_payment_method,
      participant_type = p_participant_type,
      entry_price = p_entry_price,
      max_participants = p_max_participants,
      prize_mode = p_prize_mode,
      prizes = case when p_prize_mode = 'global' then v_prizes else null end
    where id = v_tournament.id;

    return v_tournament.id;
  end if;

  if jsonb_typeof(coalesce(p_categories, '[]'::jsonb)) <> 'array' then
    raise exception 'Categories are invalid';
  end if;
  if jsonb_array_length(coalesce(p_categories, '[]'::jsonb)) < 1 then
    raise exception 'At least one category is required';
  end if;

  select exists (
    select 1 from public.tournament_brackets b where b.tournament_id = v_tournament.id
  ) into v_has_brackets;

  if exists (
    select 1
    from jsonb_array_elements(p_categories) item
    where coalesce((item->>'is_new')::boolean, false)
  ) and v_has_brackets then
    raise exception 'Categories cannot be added after a bracket exists';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_categories) item
    where nullif(item->>'id', '') is not null
    group by item->>'id'
    having count(*) > 1
  ) then
    raise exception 'Categories are invalid';
  end if;

  for v_category in
    select *
    from public.categories c
    where c.tournament_id = v_tournament.id
      and not exists (
        select 1
        from jsonb_array_elements(p_categories) item
        where not coalesce((item->>'is_new')::boolean, false)
          and nullif(item->>'id', '')::uuid = c.id
      )
  loop
    if exists (
      select 1 from public.registrations r where r.category_id = v_category.id
    ) or exists (
      select 1
      from public.registration_requests rr
      where rr.category_id = v_category.id
        and rr.consumed_at is null
        and rr.expires_at > now()
    ) or exists (
      select 1 from public.tournament_brackets b where b.category_id = v_category.id
    ) then
      raise exception 'Category cannot be deleted after requests, registrations, or a bracket exist';
    end if;

    delete from public.categories where id = v_category.id;
  end loop;

  for v_category_input in select value from jsonb_array_elements(p_categories)
  loop
    v_category_id := nullif(v_category_input->>'id', '')::uuid;
    v_category_is_new := coalesce((v_category_input->>'is_new')::boolean, false);
    v_category_name := trim(coalesce(v_category_input->>'name', ''));
    v_category_type := nullif(v_category_input->>'participant_type', '')::public.participant_type;
    v_category_price := coalesce(nullif(v_category_input->>'price', '')::numeric, 0);
    v_category_max := nullif(v_category_input->>'max_participants', '')::integer;
    v_category_start := nullif(v_category_input->>'start_at', '')::timestamp;
    v_category_address := nullif(trim(coalesce(v_category_input->>'address', '')), '');
    v_category_prizes := nullif(trim(coalesce(v_category_input->>'prizes', '')), '');

    if v_category_name = '' then raise exception 'Category name is required'; end if;
    if v_category_type is null then raise exception 'Category participant type is required'; end if;
    if v_category_price < 0 then raise exception 'Category price is invalid'; end if;
    if v_category_max is not null and v_category_max < 1 then
      raise exception 'Category max participants are invalid';
    end if;

    if v_category_id is null then raise exception 'Category id is required'; end if;

    if v_category_is_new then
      insert into public.categories (
        id, tournament_id, name, price, min_participants, max_participants,
        start_at, address, prizes, participant_type
      )
      values (
        v_category_id, v_tournament.id, v_category_name, v_category_price, 1, v_category_max,
        v_category_start, v_category_address, v_category_prizes, v_category_type
      );
    else
      select *
      into v_category
      from public.categories
      where id = v_category_id and tournament_id = v_tournament.id;

      if not found then raise exception 'Category not linked to tournament'; end if;

      select count(*),
        count(*) filter (
          where status not in (
            'cancelled'::public.registration_status,
            'expired'::public.registration_status
          )
        )
      into v_registration_count, v_active_count
      from public.registrations
      where category_id = v_category.id;

      if v_category_max is not null and v_category_max < v_active_count then
        raise exception 'Category capacity cannot be lower than active registrations';
      end if;
      if v_registration_count > 0 and (
        v_category_type is distinct from v_category.participant_type
        or v_category_price is distinct from v_category.price
      ) then
        raise exception 'Registration pricing and format cannot change after registrations exist';
      end if;

      update public.categories
      set
        name = v_category_name,
        participant_type = v_category_type,
        price = v_category_price,
        max_participants = v_category_max,
        start_at = v_category_start,
        address = v_category_address,
        prizes = v_category_prizes
      where id = v_category.id;
    end if;
  end loop;

  if p_prize_mode = 'per_category'::public.prize_mode and exists (
    select 1
    from public.categories c
    where c.tournament_id = v_tournament.id
      and nullif(trim(coalesce(c.prizes, '')), '') is null
  ) then
    raise exception 'Category prizes are required';
  end if;

  update public.tournaments
  set
    title = v_title,
    description = v_description,
    rules = v_rules,
    province = v_province,
    address = v_address,
    date = p_date,
    registration_deadline = p_registration_deadline,
    is_public = coalesce(p_is_public, true),
    poster_url = nullif(trim(coalesce(p_poster_url, '')), ''),
    payment_method = p_payment_method,
    prize_mode = p_prize_mode,
    prizes = case when p_prize_mode = 'global' then v_prizes else null end
  where id = v_tournament.id;

  return v_tournament.id;
end;
$$;

ALTER FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) OWNER TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_tournament_management_settings"(
  "uuid", "text", "text", "text", "text", "text", timestamp without time zone,
  timestamp without time zone, boolean, "text", "public"."payment_method_enum",
  "public"."participant_type", numeric, integer, "public"."prize_mode", "text", "jsonb"
) TO "authenticated";
