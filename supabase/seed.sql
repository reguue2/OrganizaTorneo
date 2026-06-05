-- Development seed data for public registration and organizer flows.
-- Safe to rerun: it replaces only tournaments owned by the seed organizer and
-- participant records using the @seed.local test domain.

do $$
declare
  v_seed_user uuid := '00000000-0000-4000-8000-000000000001';
  v_seed_email text := 'seed.organizer@example.com';
  v_seed_password text := 'Password123!';
begin
  -- Local login user for the organizer panel:
  --   email: seed.organizer@example.com
  --   password: Password123!
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_seed_user,
    'authenticated',
    'authenticated',
    v_seed_email,
    extensions.crypt(v_seed_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Organizador Seed"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    '00000000-0000-4000-8000-000000000002',
    v_seed_user,
    jsonb_build_object(
      'sub', v_seed_user::text,
      'email', v_seed_email,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    v_seed_email,
    now(),
    now(),
    now()
  )
  on conflict (provider_id, provider) do update
  set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.users (id, email, name, phone, created_at)
  values (
    v_seed_user,
    v_seed_email,
    'Organizador Seed',
    '+34 600 000 000',
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    phone = excluded.phone;

  delete from public.registration_requests
  where tournament_id in (
    select id from public.tournaments where organizer_id = v_seed_user
  );

  delete from public.tournaments
  where organizer_id = v_seed_user;

  delete from public.participants
  where contact_email ilike '%@seed.local';

  insert into public.tournaments (
    id,
    organizer_id,
    title,
    description,
    poster_url,
    prizes,
    rules,
    province,
    address,
    date,
    max_participants,
    registration_deadline,
    payment_method,
    is_public,
    status,
    has_categories,
    min_participants,
    prize_mode,
    entry_price,
    participant_type
  )
  values
    (
      '10000000-0000-4000-8000-000000000001',
      v_seed_user,
      '[Seed] Individual gratis, efectivo',
      'Caso base: sin categorias, individual, gratis y pago en efectivo.',
      null,
      null,
      'Llega 10 minutos antes del inicio.',
      'Madrid',
      'Centro Deportivo Municipal, pista 1',
      now() + interval '21 days',
      32,
      now() + interval '14 days',
      'cash',
      true,
      'published',
      false,
      1,
      'none',
      0,
      'individual'
    ),
    (
      '10000000-0000-4000-8000-000000000002',
      v_seed_user,
      '[Seed] Equipos, efectivo',
      'Sin categorias, equipos, precio fijo y validacion manual en efectivo.',
      null,
      'Trofeo y material deportivo.',
      'Inscripcion por equipo completo.',
      'Barcelona',
      'Pabellon Marina, pista central',
      now() + interval '24 days',
      16,
      now() + interval '17 days',
      'cash',
      true,
      'published',
      false,
      1,
      'global',
      25,
      'team'
    ),
    (
      '10000000-0000-4000-8000-000000000003',
      v_seed_user,
      '[Seed] Individual, online',
      'Sin categorias, individual, precio fijo y pago online.',
      null,
      null,
      null,
      'Valencia',
      'Club Norte, pista 3',
      now() + interval '26 days',
      24,
      now() + interval '18 days',
      'online',
      true,
      'published',
      false,
      1,
      'none',
      15,
      'individual'
    ),
    (
      '10000000-0000-4000-8000-000000000004',
      v_seed_user,
      '[Seed] Equipos, efectivo y online',
      'Sin categorias, equipos, precio fijo y ambos metodos de pago.',
      null,
      null,
      null,
      'Sevilla',
      'Polideportivo Sur, campo 2',
      now() + interval '28 days',
      20,
      now() + interval '20 days',
      'both',
      true,
      'published',
      false,
      1,
      'none',
      30,
      'team'
    ),
    (
      '10000000-0000-4000-8000-000000000005',
      v_seed_user,
      '[Seed] Categorias mixtas, ambos pagos',
      'Con categorias de distinto formato y precio para probar selector y resumen.',
      null,
      null,
      'Cada categoria puede tener un horario propio.',
      'Madrid',
      'Complejo Deportivo Oeste',
      now() + interval '31 days',
      null,
      now() + interval '22 days',
      'both',
      true,
      'published',
      true,
      1,
      'none',
      0,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000006',
      v_seed_user,
      '[Seed] Una categoria, efectivo',
      'Con una unica categoria para comprobar seleccion automatica.',
      null,
      null,
      null,
      'Bilbao',
      'Fronton Municipal',
      now() + interval '33 days',
      null,
      now() + interval '25 days',
      'cash',
      true,
      'published',
      true,
      1,
      'none',
      0,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000007',
      v_seed_user,
      '[Seed] Torneo lleno',
      'Sin categorias y una sola plaza ocupada.',
      null,
      null,
      null,
      'Malaga',
      'Pista Municipal 4',
      now() + interval '19 days',
      1,
      now() + interval '12 days',
      'cash',
      true,
      'published',
      false,
      1,
      'none',
      8,
      'individual'
    ),
    (
      '10000000-0000-4000-8000-000000000008',
      v_seed_user,
      '[Seed] Categoria llena',
      'Con categorias y una categoria ya sin plazas.',
      null,
      null,
      null,
      'Zaragoza',
      'CD Ebro, pabellon 1',
      now() + interval '34 days',
      null,
      now() + interval '26 days',
      'online',
      true,
      'published',
      true,
      1,
      'none',
      0,
      null
    ),
    (
      '10000000-0000-4000-8000-000000000009',
      v_seed_user,
      '[Seed] Inscripciones cerradas',
      'Estado cerrado para probar copy y bloqueo del formulario.',
      null,
      null,
      null,
      'Alicante',
      'Ciudad Deportiva',
      now() + interval '15 days',
      20,
      now() - interval '1 day',
      'cash',
      true,
      'closed',
      false,
      1,
      'none',
      12,
      'individual'
    ),
    (
      '10000000-0000-4000-8000-000000000010',
      v_seed_user,
      '[Seed] Torneo finalizado',
      'Estado finalizado para probar rutas publicas no inscribibles.',
      null,
      null,
      null,
      'Granada',
      'Pabellon Central',
      now() - interval '2 days',
      16,
      now() - interval '9 days',
      'both',
      true,
      'finished',
      false,
      1,
      'none',
      10,
      'team'
    ),
    (
      '10000000-0000-4000-8000-000000000011',
      v_seed_user,
      '[Seed] Oculto por enlace, online',
      'No aparece en explorar, pero permite probar acceso directo por URL.',
      null,
      null,
      null,
      'Cordoba',
      'Instalacion privada',
      now() + interval '29 days',
      12,
      now() + interval '21 days',
      'online',
      false,
      'published',
      false,
      1,
      'none',
      18,
      'individual'
    ),
    (
      '10000000-0000-4000-8000-000000000012',
      v_seed_user,
      '[Seed] Torneo cancelado',
      'Estado cancelado para comprobar mensajes publicos.',
      null,
      null,
      null,
      'Murcia',
      'Centro Deportivo Este',
      now() + interval '18 days',
      20,
      now() + interval '10 days',
      'cash',
      true,
      'cancelled',
      false,
      1,
      'none',
      6,
      'individual'
    );

  insert into public.categories (
    id,
    tournament_id,
    name,
    price,
    min_participants,
    max_participants,
    start_at,
    address,
    prizes,
    participant_type
  )
  values
    (
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000005',
      'Juvenil individual',
      0,
      1,
      24,
      now() + interval '31 days 10 hours',
      'Pista 1',
      null,
      'individual'
    ),
    (
      '20000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000005',
      'Senior individual',
      12,
      1,
      32,
      now() + interval '31 days 12 hours',
      'Pista 2',
      null,
      'individual'
    ),
    (
      '20000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000005',
      'Equipos mixtos',
      30,
      1,
      16,
      now() + interval '31 days 16 hours',
      'Campo 1',
      null,
      'team'
    ),
    (
      '20000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000006',
      'Absoluta',
      10,
      1,
      24,
      now() + interval '33 days 10 hours',
      null,
      null,
      'team'
    ),
    (
      '20000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000008',
      'Sub 18 completa',
      9,
      1,
      1,
      now() + interval '34 days 10 hours',
      null,
      null,
      'individual'
    ),
    (
      '20000000-0000-4000-8000-000000000006',
      '10000000-0000-4000-8000-000000000008',
      'Abierta con plazas',
      14,
      1,
      20,
      now() + interval '34 days 12 hours',
      null,
      null,
      'individual'
    );

  insert into public.participants (
    id,
    type,
    display_name,
    contact_phone,
    contact_email,
    players,
    source_registration_id
  )
  values
    (
      '30000000-0000-4000-8000-000000000001',
      'individual',
      'Seed Participante Gratis',
      '600100001',
      'gratis@seed.local',
      null,
      '40000000-0000-4000-8000-000000000001'
    ),
    (
      '30000000-0000-4000-8000-000000000002',
      'team',
      'Seed Equipo Efectivo',
      '600100002',
      'efectivo@seed.local',
      null,
      '40000000-0000-4000-8000-000000000002'
    ),
    (
      '30000000-0000-4000-8000-000000000003',
      'individual',
      'Seed Online Pendiente',
      '600100003',
      'online-pendiente@seed.local',
      null,
      '40000000-0000-4000-8000-000000000003'
    ),
    (
      '30000000-0000-4000-8000-000000000004',
      'team',
      'Seed Equipo Online Confirmado',
      '600100004',
      'online-confirmado@seed.local',
      null,
      '40000000-0000-4000-8000-000000000004'
    ),
    (
      '30000000-0000-4000-8000-000000000005',
      'individual',
      'Seed Plaza Ocupada',
      '600100005',
      'torneo-lleno@seed.local',
      null,
      '40000000-0000-4000-8000-000000000005'
    ),
    (
      '30000000-0000-4000-8000-000000000006',
      'individual',
      'Seed Categoria Ocupada',
      '600100006',
      'categoria-llena@seed.local',
      null,
      '40000000-0000-4000-8000-000000000006'
    ),
    (
      '30000000-0000-4000-8000-000000000007',
      'individual',
      'Seed Cancelado',
      '600100007',
      'cancelado@seed.local',
      null,
      '40000000-0000-4000-8000-000000000007'
    );

  insert into public.registrations (
    id,
    category_id,
    status,
    payment_method,
    created_at,
    participant_id,
    tournament_id,
    public_reference,
    contact_email_normalized,
    contact_phone_normalized,
    cancel_code_hash,
    cancel_token_hash,
    cancelled_at
  )
  values
    (
      '40000000-0000-4000-8000-000000000001',
      null,
      'confirmed',
      'cash',
      now() - interval '6 days',
      '30000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001',
      'SEED-FREE-001',
      public.normalize_email('gratis@seed.local'),
      public.normalize_spanish_phone('600100001'),
      extensions.crypt('111111', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-001'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000002',
      null,
      'pending_cash_validation',
      'cash',
      now() - interval '5 days',
      '30000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-001',
      public.normalize_email('efectivo@seed.local'),
      public.normalize_spanish_phone('600100002'),
      extensions.crypt('222222', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-002'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000003',
      null,
      'pending_online_payment',
      'online',
      now() - interval '4 days',
      '30000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000003',
      'SEED-ONLINE-001',
      public.normalize_email('online-pendiente@seed.local'),
      public.normalize_spanish_phone('600100003'),
      extensions.crypt('333333', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-003'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000004',
      null,
      'confirmed',
      'online',
      now() - interval '3 days',
      '30000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000004',
      'SEED-BOTH-001',
      public.normalize_email('online-confirmado@seed.local'),
      public.normalize_spanish_phone('600100004'),
      extensions.crypt('444444', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-004'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000005',
      null,
      'confirmed',
      'cash',
      now() - interval '2 days',
      '30000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000007',
      'SEED-FULL-001',
      public.normalize_email('torneo-lleno@seed.local'),
      public.normalize_spanish_phone('600100005'),
      extensions.crypt('555555', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-005'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000006',
      '20000000-0000-4000-8000-000000000005',
      'confirmed',
      'online',
      now() - interval '2 days',
      '30000000-0000-4000-8000-000000000006',
      '10000000-0000-4000-8000-000000000008',
      'SEED-CATFULL-001',
      public.normalize_email('categoria-llena@seed.local'),
      public.normalize_spanish_phone('600100006'),
      extensions.crypt('666666', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-006'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000007',
      null,
      'cancelled',
      'cash',
      now() - interval '7 days',
      '30000000-0000-4000-8000-000000000007',
      '10000000-0000-4000-8000-000000000001',
      'SEED-CANCEL-001',
      public.normalize_email('cancelado@seed.local'),
      public.normalize_spanish_phone('600100007'),
      extensions.crypt('777777', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-007'),
      now() - interval '1 day'
    );

  insert into public.payments (
    id,
    registration_id,
    amount,
    currency,
    payment_method,
    status,
    stripe_payment_intent_id,
    paid_at,
    created_at
  )
  values
    (
      '50000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000001',
      0,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '6 days',
      now() - interval '6 days'
    ),
    (
      '50000000-0000-4000-8000-000000000002',
      '40000000-0000-4000-8000-000000000002',
      25,
      'eur',
      'cash',
      'pending',
      null,
      null,
      now() - interval '5 days'
    ),
    (
      '50000000-0000-4000-8000-000000000003',
      '40000000-0000-4000-8000-000000000003',
      15,
      'eur',
      'online',
      'pending',
      null,
      null,
      now() - interval '4 days'
    ),
    (
      '50000000-0000-4000-8000-000000000004',
      '40000000-0000-4000-8000-000000000004',
      30,
      'eur',
      'online',
      'paid',
      'pi_seed_confirmed',
      now() - interval '3 days',
      now() - interval '3 days'
    ),
    (
      '50000000-0000-4000-8000-000000000005',
      '40000000-0000-4000-8000-000000000005',
      8,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '2 days',
      now() - interval '2 days'
    ),
    (
      '50000000-0000-4000-8000-000000000006',
      '40000000-0000-4000-8000-000000000006',
      9,
      'eur',
      'online',
      'paid',
      'pi_seed_category_full',
      now() - interval '2 days',
      now() - interval '2 days'
    ),
    (
      '50000000-0000-4000-8000-000000000007',
      '40000000-0000-4000-8000-000000000007',
      0,
      'eur',
      'cash',
      'refunded',
      null,
      null,
      now() - interval '7 days'
    );

  insert into public.registration_requests (
    id,
    tournament_id,
    category_id,
    participant_type,
    display_name,
    contact_phone,
    contact_phone_normalized,
    contact_email,
    contact_email_normalized,
    players,
    payment_method,
    verification_code_hash,
    verification_token_hash,
    expires_at,
    verified_at,
    consumed_at,
    registration_id,
    created_at,
    resend_count,
    last_email_sent_at
  )
  values
    (
      '60000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000005',
      '20000000-0000-4000-8000-000000000002',
      'individual',
      'Seed Solicitud Pendiente',
      '600100101',
      public.normalize_spanish_phone('600100101'),
      'solicitud-pendiente@seed.local',
      public.normalize_email('solicitud-pendiente@seed.local'),
      null,
      'cash',
      extensions.crypt('123456', extensions.gen_salt('bf')),
      public.sha256_hex('seed-verification-token'),
      now() + interval '30 minutes',
      null,
      null,
      null,
      now() - interval '5 minutes',
      0,
      now() - interval '5 minutes'
    );
end $$;

