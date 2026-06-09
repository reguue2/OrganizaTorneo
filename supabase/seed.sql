-- Development seed data for public registration and organizer flows.
-- Safe to rerun: it replaces only tournaments owned by the seed organizer and
-- participant records using the @seed.local test domain.

do $$
declare
  v_seed_user uuid := '00000000-0000-4000-8000-000000000001';
  v_seed_email text := 'seed.organizer@example.com';
  v_seed_password text := 'Password123!';
  v_target record;
  v_index integer;
  v_bulk_index integer := 0;
  v_participant_id uuid;
  v_registration_id uuid;
  v_payment_id uuid;
  v_registration_status public.registration_status;
  v_registration_payment_method public.registration_payment_method;
  v_payment_status public.payment_status;
  v_created_at timestamp with time zone;
  v_display_name text;
  v_contact_phone text;
  v_contact_email text;
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
    ),
    (
      '30000000-0000-4000-8000-000000000008',
      'team',
      'Los Halcones',
      '600100008',
      'halcones@seed.local',
      null,
      '40000000-0000-4000-8000-000000000008'
    ),
    (
      '30000000-0000-4000-8000-000000000009',
      'team',
      'Club Norte',
      '600100009',
      'club-norte@seed.local',
      null,
      '40000000-0000-4000-8000-000000000009'
    ),
    (
      '30000000-0000-4000-8000-000000000010',
      'team',
      'Titanes Madrid',
      '600100010',
      'titanes@seed.local',
      null,
      '40000000-0000-4000-8000-000000000010'
    ),
    (
      '30000000-0000-4000-8000-000000000011',
      'team',
      'Barrio Unido',
      '600100011',
      'barrio-unido@seed.local',
      null,
      '40000000-0000-4000-8000-000000000011'
    ),
    (
      '30000000-0000-4000-8000-000000000012',
      'team',
      'Deportivo Sur',
      '600100012',
      'deportivo-sur@seed.local',
      null,
      '40000000-0000-4000-8000-000000000012'
    ),
    (
      '30000000-0000-4000-8000-000000000013',
      'team',
      'Rayo Azul',
      '600100013',
      'rayo-azul@seed.local',
      null,
      '40000000-0000-4000-8000-000000000013'
    ),
    (
      '30000000-0000-4000-8000-000000000014',
      'team',
      'Unión Central',
      '600100014',
      'union-central@seed.local',
      null,
      '40000000-0000-4000-8000-000000000014'
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
    ),
    (
      '40000000-0000-4000-8000-000000000008',
      null,
      'confirmed',
      'cash',
      now() - interval '4 days 12 hours',
      '30000000-0000-4000-8000-000000000008',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-002',
      public.normalize_email('halcones@seed.local'),
      public.normalize_spanish_phone('600100008'),
      extensions.crypt('888888', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-008'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000009',
      null,
      'confirmed',
      'cash',
      now() - interval '4 days',
      '30000000-0000-4000-8000-000000000009',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-003',
      public.normalize_email('club-norte@seed.local'),
      public.normalize_spanish_phone('600100009'),
      extensions.crypt('999999', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-009'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000010',
      null,
      'confirmed',
      'cash',
      now() - interval '3 days 12 hours',
      '30000000-0000-4000-8000-000000000010',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-004',
      public.normalize_email('titanes@seed.local'),
      public.normalize_spanish_phone('600100010'),
      extensions.crypt('101010', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-010'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000011',
      null,
      'confirmed',
      'cash',
      now() - interval '3 days',
      '30000000-0000-4000-8000-000000000011',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-005',
      public.normalize_email('barrio-unido@seed.local'),
      public.normalize_spanish_phone('600100011'),
      extensions.crypt('111112', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-011'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000012',
      null,
      'pending_cash_validation',
      'cash',
      now() - interval '2 days',
      '30000000-0000-4000-8000-000000000012',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-006',
      public.normalize_email('deportivo-sur@seed.local'),
      public.normalize_spanish_phone('600100012'),
      extensions.crypt('121212', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-012'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000013',
      null,
      'pending_cash_validation',
      'cash',
      now() - interval '1 day',
      '30000000-0000-4000-8000-000000000013',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-007',
      public.normalize_email('rayo-azul@seed.local'),
      public.normalize_spanish_phone('600100013'),
      extensions.crypt('131313', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-013'),
      null
    ),
    (
      '40000000-0000-4000-8000-000000000014',
      null,
      'cancelled',
      'cash',
      now() - interval '6 days',
      '30000000-0000-4000-8000-000000000014',
      '10000000-0000-4000-8000-000000000002',
      'SEED-CASH-008',
      public.normalize_email('union-central@seed.local'),
      public.normalize_spanish_phone('600100014'),
      extensions.crypt('141414', extensions.gen_salt('bf')),
      public.sha256_hex('seed-cancel-token-014'),
      now() - interval '12 hours'
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
    ),
    (
      '50000000-0000-4000-8000-000000000008',
      '40000000-0000-4000-8000-000000000008',
      25,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '4 days 12 hours',
      now() - interval '4 days 12 hours'
    ),
    (
      '50000000-0000-4000-8000-000000000009',
      '40000000-0000-4000-8000-000000000009',
      25,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '4 days',
      now() - interval '4 days'
    ),
    (
      '50000000-0000-4000-8000-000000000010',
      '40000000-0000-4000-8000-000000000010',
      25,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '3 days 12 hours',
      now() - interval '3 days 12 hours'
    ),
    (
      '50000000-0000-4000-8000-000000000011',
      '40000000-0000-4000-8000-000000000011',
      25,
      'eur',
      'cash',
      'paid',
      null,
      now() - interval '3 days',
      now() - interval '3 days'
    ),
    (
      '50000000-0000-4000-8000-000000000012',
      '40000000-0000-4000-8000-000000000012',
      25,
      'eur',
      'cash',
      'pending',
      null,
      null,
      now() - interval '2 days'
    ),
    (
      '50000000-0000-4000-8000-000000000013',
      '40000000-0000-4000-8000-000000000013',
      25,
      'eur',
      'cash',
      'pending',
      null,
      null,
      now() - interval '1 day'
    ),
    (
      '50000000-0000-4000-8000-000000000014',
      '40000000-0000-4000-8000-000000000014',
      25,
      'eur',
      'cash',
      'refunded',
      null,
      null,
      now() - interval '6 days'
    );

  -- Add enough registrations to exercise participant lists, filters, counters,
  -- categories and brackets in representative seeded tournaments. Some
  -- published and closed tournaments intentionally remain empty so structural
  -- configuration and manual-registration flows can still be tested after a
  -- reset. The capacity trigger is disabled only for this controlled block so
  -- full tournaments can also keep historical cancelled and expired records.
  alter table public.registrations disable trigger check_registration_before_insert;

  for v_target in
    select *
    from (
      select
        t.id as tournament_id,
        null::uuid as category_id,
        t.title as target_name,
        t.participant_type,
        t.payment_method,
        t.status as tournament_status,
        t.entry_price as price,
        case
          when t.status = 'cancelled' then 0
          else least(
            6,
            greatest(
              coalesce(t.max_participants, count(r.id)::integer + 6) - count(r.id)::integer,
              0
            )
          )
        end as active_slots
      from public.tournaments t
      left join public.registrations r
        on r.tournament_id = t.id
        and r.category_id is null
        and r.status not in ('cancelled', 'expired')
      where t.organizer_id = v_seed_user
        and not t.has_categories
      group by
        t.id,
        t.title,
        t.participant_type,
        t.payment_method,
        t.entry_price,
        t.max_participants,
        t.status

      union all

      select
        t.id as tournament_id,
        c.id as category_id,
        t.title || ' / ' || c.name as target_name,
        c.participant_type,
        t.payment_method,
        t.status as tournament_status,
        c.price,
        case
          when t.status = 'cancelled' then 0
          else least(
            6,
            greatest(
              coalesce(c.max_participants, count(r.id)::integer + 6) - count(r.id)::integer,
              0
            )
          )
        end as active_slots
      from public.tournaments t
      join public.categories c on c.tournament_id = t.id
      left join public.registrations r
        on r.category_id = c.id
        and r.status not in ('cancelled', 'expired')
      where t.organizer_id = v_seed_user
        and t.has_categories
      group by
        t.id,
        c.id,
        t.title,
        c.name,
        c.participant_type,
        t.payment_method,
        c.price,
        c.max_participants,
        t.status
    ) targets
    where tournament_id in (
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000005',
      '10000000-0000-4000-8000-000000000007',
      '10000000-0000-4000-8000-000000000008',
      '10000000-0000-4000-8000-000000000010',
      '10000000-0000-4000-8000-000000000012'
    )
    order by tournament_id, category_id nulls first
  loop
    for v_index in 1..10
    loop
      v_bulk_index := v_bulk_index + 1;
      v_participant_id := md5('seed-bulk-participant-' || v_bulk_index::text)::uuid;
      v_registration_id := md5('seed-bulk-registration-' || v_bulk_index::text)::uuid;
      v_payment_id := md5('seed-bulk-payment-' || v_bulk_index::text)::uuid;
      v_created_at := now() - make_interval(days => 15 - v_index);
      v_contact_phone := '610' || lpad(v_bulk_index::text, 6, '0');
      v_contact_email := 'bulk-' || lpad(v_bulk_index::text, 3, '0') || '@seed.local';
      v_display_name :=
        case
          when v_target.participant_type = 'team' then 'Seed Equipo '
          else 'Seed Participante '
        end
        || lpad(v_index::text, 2, '0')
        || ' - '
        || v_target.target_name;

      if v_target.payment_method = 'both' then
        v_registration_payment_method :=
          case
            when mod(v_index, 2) = 0 then 'online'::public.registration_payment_method
            else 'cash'::public.registration_payment_method
          end;
      else
        v_registration_payment_method :=
          v_target.payment_method::text::public.registration_payment_method;
      end if;

      if v_index > v_target.active_slots then
        v_registration_status :=
          case
            when mod(v_index, 2) = 0 then 'expired'::public.registration_status
            else 'cancelled'::public.registration_status
          end;
      elsif v_target.tournament_status = 'finished'::public.tournament_status then
        v_registration_status := 'confirmed'::public.registration_status;
      elsif mod(v_index, 4) = 0 then
        v_registration_status :=
          case
            when v_registration_payment_method = 'online'
              then 'pending_online_payment'::public.registration_status
            else 'pending_cash_validation'::public.registration_status
          end;
      else
        v_registration_status := 'confirmed'::public.registration_status;
      end if;

      v_payment_status :=
        case
          when v_registration_status = 'confirmed' then 'paid'::public.payment_status
          when v_registration_status = 'cancelled' then 'refunded'::public.payment_status
          else 'pending'::public.payment_status
        end;

      insert into public.participants (
        id,
        type,
        display_name,
        contact_phone,
        contact_email,
        players,
        created_at,
        source_registration_id
      )
      values (
        v_participant_id,
        v_target.participant_type,
        v_display_name,
        v_contact_phone,
        v_contact_email,
        null,
        v_created_at,
        v_registration_id
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
      values (
        v_registration_id,
        v_target.category_id,
        v_registration_status,
        v_registration_payment_method,
        v_created_at,
        v_participant_id,
        v_target.tournament_id,
        'SEED-BULK-' || lpad(v_bulk_index::text, 3, '0'),
        public.normalize_email(v_contact_email),
        public.normalize_spanish_phone(v_contact_phone),
        null,
        public.sha256_hex('seed-bulk-cancel-token-' || v_bulk_index::text),
        case
          when v_registration_status = 'cancelled' then v_created_at + interval '2 days'
          else null
        end
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
      values (
        v_payment_id,
        v_registration_id,
        v_target.price,
        'eur',
        v_registration_payment_method,
        v_payment_status,
        case
          when v_payment_status = 'paid' and v_registration_payment_method = 'online'
            then 'pi_seed_bulk_' || lpad(v_bulk_index::text, 3, '0')
          else null
        end,
        case when v_payment_status = 'paid' then v_created_at else null end,
        v_created_at
      );
    end loop;
  end loop;

  alter table public.registrations enable trigger check_registration_before_insert;

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
