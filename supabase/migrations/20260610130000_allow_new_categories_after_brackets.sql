-- Brackets and registrations belong to individual categories, so adding a new
-- category does not invalidate the existing tournament structure.
DO $migration$
DECLARE
  v_definition text;
  v_obsolete_declaration text := E'  v_has_brackets boolean;\n';
  v_obsolete_guard text := $guard$
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

$guard$;
BEGIN
  SELECT pg_get_functiondef(
    'public.update_tournament_management_settings_core(uuid,text,text,text,text,text,timestamp without time zone,timestamp without time zone,boolean,text,public.payment_method_enum,public.participant_type,numeric,integer,public.prize_mode,text,jsonb)'::regprocedure
  )
  INTO v_definition;

  IF strpos(v_definition, v_obsolete_guard) > 0 THEN
    v_definition := replace(v_definition, v_obsolete_guard, '');
  END IF;

  IF strpos(v_definition, v_obsolete_declaration) > 0 THEN
    v_definition := replace(v_definition, v_obsolete_declaration, '');
  END IF;

  IF strpos(v_definition, 'Categories cannot be added after a bracket exists') > 0 THEN
    RAISE EXCEPTION 'Category bracket guard could not be removed';
  END IF;

  EXECUTE v_definition;
END;
$migration$;
