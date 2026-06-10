-- Local development seed for OrganizaTorneo.
--
-- Run from the repository root with:
--   pnpm exec supabase db reset
--
-- Test organizer accounts:
--   seed.organizer@example.com / Password123!
--   marina.organizer@example.com / Password123!
--
-- Predictable public-flow secrets:
--   Pending verification request code: 123456
--   Registration cancellation code:    654321

select set_config('app.bypass_registration_window', 'on', false);

-- ---------------------------------------------------------------------------
-- Organizer accounts
-- ---------------------------------------------------------------------------

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
  recovery_token,
  email_change_token_new,
  email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'seed.organizer@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now() - interval '180 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Daniel Romero"}'::jsonb,
    now() - interval '180 days',
    now() - interval '2 hours',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'marina.organizer@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now() - interval '90 days',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Marina Torres"}'::jsonb,
    now() - interval '90 days',
    now() - interval '1 day',
    '',
    '',
    '',
    ''
  );

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '{"sub":"10000000-0000-4000-8000-000000000001","email":"seed.organizer@example.com","email_verified":true}'::jsonb,
    'email',
    now() - interval '2 hours',
    now() - interval '180 days',
    now() - interval '2 hours'
  ),
  (
    '11000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    '{"sub":"10000000-0000-4000-8000-000000000002","email":"marina.organizer@example.com","email_verified":true}'::jsonb,
    'email',
    now() - interval '1 day',
    now() - interval '90 days',
    now() - interval '1 day'
  );

update public.users
set
  name = 'Daniel Romero',
  phone = '+34 952 410 286',
  whatsapp = '+34 611 240 873',
  public_contact = true,
  stripe_account_id = 'acct_seed_daniel'
where id = '10000000-0000-4000-8000-000000000001';

update public.users
set
  name = 'Marina Torres',
  phone = '+34 954 228 194',
  whatsapp = '+34 622 318 451',
  public_contact = false
where id = '10000000-0000-4000-8000-000000000002';

-- ---------------------------------------------------------------------------
-- Tournaments and categories
-- ---------------------------------------------------------------------------

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
  created_at,
  has_categories,
  min_participants,
  prize_mode,
  entry_price,
  updated_at,
  participant_type
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Copa Costa del Sol de Pádel 2026',
    'Fin de semana de pádel para clubes y parejas de toda Andalucía. Incluye fase de grupos, eliminatorias y actividades para acompañantes.',
    null,
    null,
    'Partidos al mejor de tres sets con súper tie-break a diez puntos. Diez minutos de cortesía. La organización facilitará bolas nuevas en cada ronda.',
    'Málaga',
    'Club Deportivo El Candado, Avenida Principal 3, Málaga',
    now() + interval '14 days',
    null,
    now() - interval '1 day',
    'both',
    true,
    'closed',
    now() - interval '75 days',
    true,
    1,
    'per_category',
    0,
    now() - interval '1 day',
    null
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Liga Municipal de Tenis Primavera',
    'Liga individual abierta a jugadores aficionados. Cada participante tendrá un mínimo de tres partidos.',
    null,
    'Trofeo, material deportivo y bono de clases para los tres primeros puestos.',
    'Partidos a dos sets cortos y súper tie-break de desempate. Se aplicará el reglamento RFET.',
    'Málaga',
    'Ciudad Deportiva de Carranque, Avenida Santa Rosa de Lima 7, Málaga',
    now() + interval '45 days',
    32,
    now() + interval '30 days',
    'both',
    true,
    'published',
    now() - interval '20 days',
    false,
    8,
    'global',
    18,
    now() - interval '3 hours',
    'individual'
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    'Open de Ajedrez Villa de Málaga 2026',
    'Open suizo para jugadores federados y aficionados celebrado en el centro histórico.',
    null,
    '1.º: 500 €, 2.º: 300 €, 3.º: 150 € y premio especial sub-18.',
    'Ritmo de juego de 15 minutos más 10 segundos por jugada. Sistema de desempate Buchholz.',
    'Málaga',
    'Centro Cultural Provincial, Calle Ollerías 34, Málaga',
    now() - interval '30 days',
    16,
    now() - interval '45 days',
    'online',
    true,
    'finished',
    now() - interval '120 days',
    false,
    8,
    'global',
    10,
    now() - interval '29 days',
    'individual'
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    'Torneo Solidario de Fútbol 7',
    'Jornada benéfica a favor del deporte base local.',
    null,
    'Trofeos para campeón, subcampeón y equipo más deportivo.',
    'Plantillas de hasta doce jugadores. Partidos de dos tiempos de veinte minutos.',
    'Málaga',
    'Campos Municipales de Guadalmar, Calle Wilkinson 12, Málaga',
    now() + interval '20 days',
    16,
    now() + interval '10 days',
    'cash',
    true,
    'cancelled',
    now() - interval '40 days',
    false,
    4,
    'global',
    80,
    now() - interval '2 days',
    'team'
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    'Copa Universitaria de Baloncesto 3x3',
    'Borrador de torneo universitario pendiente de confirmar instalación y horarios.',
    null,
    null,
    null,
    'Málaga',
    null,
    now() + interval '80 days',
    24,
    now() + interval '65 days',
    'cash',
    false,
    'draft',
    now() - interval '3 days',
    false,
    4,
    'none',
    30,
    now() - interval '2 hours',
    'team'
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000002',
    'Circuito Sevillano de Vóley Playa',
    'Prueba abierta por parejas con cuadro principal y consolación.',
    null,
    'Material deportivo para las parejas finalistas.',
    'Parejas de dos jugadores. Partidos a un set de 21 puntos.',
    'Sevilla',
    'Centro Deportivo San Pablo, Avenida Doctor Laffón Soto, Sevilla',
    now() + interval '60 days',
    24,
    now() + interval '40 days',
    'online',
    true,
    'published',
    now() - interval '10 days',
    false,
    4,
    'global',
    24,
    now() - interval '5 hours',
    'team'
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
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Primera Masculina',
    45,
    8,
    24,
    now() + interval '14 days 2 hours',
    'Pistas 1 a 4, Club Deportivo El Candado',
    'Campeones: 600 € y trofeo. Finalistas: 250 € y trofeo.',
    'team'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Primera Femenina',
    45,
    8,
    20,
    now() + interval '14 days 3 hours',
    'Pistas 5 a 8, Club Deportivo El Candado',
    'Campeonas: 600 € y trofeo. Finalistas: 250 € y trofeo.',
    'team'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    'Mixto Open',
    40,
    8,
    20,
    now() + interval '14 days 5 hours',
    'Pistas 9 a 12, Club Deportivo El Candado',
    'Campeones: lote deportivo y dos bonos de clases.',
    'team'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000001',
    'Individual Sub-18',
    12,
    8,
    24,
    now() + interval '15 days 1 hour',
    'Pistas 1 a 4, Club Deportivo El Candado',
    'Trofeo y beca trimestral de entrenamiento para el campeón.',
    'individual'
  );

-- ---------------------------------------------------------------------------
-- Registrations, participants and payments
-- ---------------------------------------------------------------------------

do $seed_data$
begin

create unlogged table public.seed_registration_entries (
  seed_no integer primary key,
  tournament_id uuid not null,
  category_id uuid,
  participant_type public.participant_type not null,
  display_name text not null,
  registration_status public.registration_status not null,
  registration_payment_method public.registration_payment_method not null,
  amount numeric not null
);

insert into public.seed_registration_entries
select
  ordinality::integer,
  '20000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000001'::uuid,
  'team'::public.participant_type,
  display_name,
  case
    when ordinality <= 12 then 'confirmed'
    when ordinality = 13 then 'pending_cash_validation'
    when ordinality = 14 then 'pending_online_payment'
    when ordinality = 15 then 'cancelled'
    else 'expired'
  end::public.registration_status,
  case when ordinality in (2, 4, 6, 8, 10, 12, 14, 15) then 'online' else 'cash' end::public.registration_payment_method,
  45
from unnest(array[
  'Club Pádel Axarquía',
  'Los Remontadores',
  'Smash Point Málaga',
  'Pareja del Limonar',
  'Costa Pádel Team',
  'Los de la Reja',
  'Pádel Torremolinos',
  'Volea y Bandeja',
  'Rincón Pádel Club',
  'Los Globos de Oro',
  'Benalmádena Match Point',
  'Mijas Pádel Center',
  'Los Tie-Break',
  'Equipo Malagueta',
  'Pádel Alameda',
  'Los Veteranos del Sur'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  20 + ordinality::integer,
  '20000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000002'::uuid,
  'team'::public.participant_type,
  display_name,
  case
    when ordinality <= 8 then 'confirmed'
    when ordinality <= 10 then 'pending_cash_validation'
    when ordinality = 11 then 'cancelled'
    else 'expired'
  end::public.registration_status,
  case when ordinality in (2, 4, 6, 8, 11) then 'online' else 'cash' end::public.registration_payment_method,
  45
from unnest(array[
  'Las Panteras del Pádel',
  'Volea Femenina Málaga',
  'Las Incombustibles',
  'Pádel La Cala',
  'Las Reinas de la Red',
  'Marbella Match',
  'Las Bandejas',
  'Alhaurín Pádel Girls',
  'Las del Tercer Set',
  'Equipo Pedregalejo',
  'Punto de Oro',
  'Las Lobas del Sur'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  40 + ordinality::integer,
  '20000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000003'::uuid,
  'team'::public.participant_type,
  display_name,
  case
    when ordinality <= 10 then 'confirmed'
    when ordinality = 11 then 'pending_online_payment'
    else 'cancelled'
  end::public.registration_status,
  case when ordinality in (2, 4, 6, 8, 10, 11, 12) then 'online' else 'cash' end::public.registration_payment_method,
  40
from unnest(array[
  'Dúo Mediterráneo',
  'Los Cruzados',
  'Pareja Alameda',
  'Volea Mixta',
  'Team Alcazaba',
  'Los Boquerones',
  'Pádel sin Fronteras',
  'Dúo Gibralfaro',
  'La Pareja del Puerto',
  'Team Guadalhorce',
  'Mixto El Palo',
  'Los del Último Punto'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  60 + ordinality::integer,
  '20000000-0000-4000-8000-000000000001'::uuid,
  '30000000-0000-4000-8000-000000000004'::uuid,
  'individual'::public.participant_type,
  display_name,
  case
    when ordinality <= 8 then 'confirmed'
    when ordinality = 9 then 'pending_cash_validation'
    when ordinality = 10 then 'pending_online_payment'
    when ordinality = 11 then 'cancelled'
    else 'expired'
  end::public.registration_status,
  case when ordinality in (2, 4, 6, 8, 10, 11) then 'online' else 'cash' end::public.registration_payment_method,
  12
from unnest(array[
  'Alejandro Ruiz Martín',
  'Lucía Fernández Vega',
  'Hugo Navarro León',
  'Sofía Jiménez Ortiz',
  'Martín Castillo Ramos',
  'Paula Moreno Gil',
  'Daniel Sánchez Rojas',
  'Carla Romero Díaz',
  'Adrián Molina Cruz',
  'Elena Prieto Santos',
  'Mario Ortega Vidal',
  'Claudia Reyes Cano'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  80 + ordinality::integer,
  '20000000-0000-4000-8000-000000000002'::uuid,
  null::uuid,
  'individual'::public.participant_type,
  display_name,
  case
    when ordinality <= 8 or ordinality = 16 then 'confirmed'
    when ordinality <= 11 then 'pending_cash_validation'
    when ordinality <= 13 then 'pending_online_payment'
    when ordinality = 14 then 'cancelled'
    else 'expired'
  end::public.registration_status,
  case when ordinality in (2, 4, 6, 8, 12, 13, 14, 16) then 'online' else 'cash' end::public.registration_payment_method,
  18
from unnest(array[
  'Javier Morales Pérez',
  'Andrea López Fuentes',
  'Pablo Herrera Núñez',
  'Marta Cabrera Soler',
  'Álvaro Domínguez Rey',
  'Irene Pastor Blanco',
  'Guillermo Martín Pardo',
  'Natalia Gómez Vidal',
  'Sergio Medina Torres',
  'Beatriz Ramos Peña',
  'Rubén Castro Lara',
  'Cristina Suárez Nieto',
  'Víctor Aguilar Montes',
  'Laura Benítez Flores',
  'Óscar León Crespo',
  'Noelia Serrano Muñoz'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  100 + ordinality::integer,
  '20000000-0000-4000-8000-000000000003'::uuid,
  null::uuid,
  'individual'::public.participant_type,
  display_name,
  'confirmed'::public.registration_status,
  'online'::public.registration_payment_method,
  10
from unnest(array[
  'Antonio Valdés Romero',
  'Carmen Pineda Ruiz',
  'Francisco Javier Soto',
  'María Luisa Carrasco',
  'Raúl Espejo Molina',
  'Teresa Villalba Cano',
  'Ignacio Robles Vera',
  'Ana Belén Arias'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.seed_registration_entries
select
  110 + ordinality::integer,
  '20000000-0000-4000-8000-000000000004'::uuid,
  null::uuid,
  'team'::public.participant_type,
  display_name,
  'cancelled'::public.registration_status,
  'cash'::public.registration_payment_method,
  80
from unnest(array[
  'Atlético Guadalmar',
  'Deportivo Huelin',
  'Unión Portada Alta',
  'Sporting Teatinos',
  'Club El Palo',
  'Veteranos de Churriana'
]::text[]) with ordinality as names(display_name, ordinality);

insert into public.participants (
  id,
  type,
  display_name,
  contact_phone,
  contact_email,
  players,
  created_at
)
select
  format('40000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0'))::uuid,
  participant_type,
  display_name,
  '+346' || lpad((10000000 + seed_no)::text, 8, '0'),
  'participante+' || lpad(seed_no::text, 3, '0') || '@demo.organizatorneo.test',
  case
    when participant_type = 'team' then jsonb_build_array(
      jsonb_build_object(
        'name',
        (array[
          'Alberto Rivas', 'Carlos Medina', 'David Luque', 'Eduardo Pardo',
          'Fernando Calvo', 'Gabriel Santos', 'Héctor Molina', 'Iván Ruiz',
          'Jorge Navarro', 'Luis Romero', 'Manuel Ortega', 'Pablo Vega',
          'Raquel Prieto', 'Sara Campos', 'Teresa León', 'Verónica Gil'
        ]::text[])[(seed_no % 16) + 1]
      ),
      jsonb_build_object(
        'name',
        (array[
          'Adriana Flores', 'Beatriz Cruz', 'Clara Martín', 'Daniela Reyes',
          'Elena Vidal', 'Inés Castillo', 'Laura Moreno', 'Marcos Pastor',
          'Nerea Cabrera', 'Óscar Peña', 'Patricia Soler', 'Rubén Torres',
          'Sergio Ramos', 'Silvia Fuentes', 'Víctor Herrera', 'Yolanda Nieto'
        ]::text[])[((seed_no + 5) % 16) + 1]
      )
    )
    else null
  end,
  now() - make_interval(days => 60 - (seed_no % 50))
from public.seed_registration_entries;

alter table public.registrations disable trigger check_registration_before_insert;

with secrets as (
  select extensions.crypt('654321', extensions.gen_salt('bf')) as cancel_code_hash
)
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
select
  format('50000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0'))::uuid,
  category_id,
  registration_status,
  registration_payment_method,
  now() - make_interval(days => 60 - (seed_no % 50)),
  format('40000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0'))::uuid,
  tournament_id,
  'OT-2026-' || lpad(seed_no::text, 5, '0'),
  'participante+' || lpad(seed_no::text, 3, '0') || '@demo.organizatorneo.test',
  '+346' || lpad((10000000 + seed_no)::text, 8, '0'),
  secrets.cancel_code_hash,
  public.sha256_hex('seed-cancel-token-' || seed_no::text),
  case when registration_status = 'cancelled' then now() - interval '2 days' else null end
from public.seed_registration_entries
cross join secrets;

alter table public.registrations enable trigger check_registration_before_insert;

update public.participants p
set source_registration_id = format(
  '50000000-0000-4000-8000-%s',
  right(p.id::text, 12)
)::uuid
where p.id::text like '40000000-0000-4000-8000-%';

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
select
  format('60000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0'))::uuid,
  format('50000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0'))::uuid,
  amount,
  'eur',
  registration_payment_method,
  case
    when registration_status = 'confirmed' then 'paid'
    when registration_status = 'cancelled' then 'refunded'
    else 'pending'
  end::public.payment_status,
  case
    when registration_payment_method = 'online' then 'pi_seed_' || lpad(seed_no::text, 6, '0')
    else null
  end,
  case
    when registration_status in ('confirmed', 'cancelled') then now() - interval '3 days'
    else null
  end,
  now() - make_interval(days => 60 - (seed_no % 50))
from public.seed_registration_entries;

-- ---------------------------------------------------------------------------
-- Registration requests
-- ---------------------------------------------------------------------------

with request_secret as (
  select extensions.crypt('123456', extensions.gen_salt('bf')) as code_hash
)
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
select
  request_id,
  tournament_id,
  category_id,
  participant_type,
  display_name,
  contact_phone,
  contact_phone,
  contact_email,
  lower(contact_email),
  players,
  payment_method,
  request_secret.code_hash,
  public.sha256_hex('seed-verification-token-' || request_no::text),
  expires_at,
  verified_at,
  consumed_at,
  registration_id,
  created_at,
  resend_count,
  last_email_sent_at
from (
  values
    (
      1,
      '70000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid,
      null::uuid,
      'individual'::public.participant_type,
      'Eva Márquez Soto',
      '+34621000001',
      'eva.marquez@example.com',
      null::jsonb,
      'cash'::public.registration_payment_method,
      now() + interval '25 minutes',
      null::timestamptz,
      null::timestamptz,
      null::uuid,
      now() - interval '5 minutes',
      0,
      now() - interval '5 minutes'
    ),
    (
      2,
      '70000000-0000-4000-8000-000000000002'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid,
      null::uuid,
      'individual'::public.participant_type,
      'Miguel Ángel Peña',
      '+34621000002',
      'miguel.pena@example.com',
      null::jsonb,
      'online'::public.registration_payment_method,
      now() + interval '20 minutes',
      null::timestamptz,
      null::timestamptz,
      null::uuid,
      now() - interval '45 minutes',
      2,
      now() - interval '10 minutes'
    ),
    (
      3,
      '70000000-0000-4000-8000-000000000003'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid,
      null::uuid,
      'individual'::public.participant_type,
      'Rocío Campos Vera',
      '+34621000003',
      'rocio.campos@example.com',
      null::jsonb,
      'cash'::public.registration_payment_method,
      now() - interval '2 hours',
      null::timestamptz,
      null::timestamptz,
      null::uuid,
      now() - interval '3 hours',
      0,
      now() - interval '3 hours'
    ),
    (
      4,
      '70000000-0000-4000-8000-000000000004'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid,
      null::uuid,
      'individual'::public.participant_type,
      'Samuel Ortiz Bravo',
      '+34621000004',
      'samuel.ortiz@example.com',
      null::jsonb,
      'online'::public.registration_payment_method,
      now() + interval '15 minutes',
      now() - interval '5 minutes',
      null::timestamptz,
      null::uuid,
      now() - interval '20 minutes',
      1,
      now() - interval '8 minutes'
    ),
    (
      5,
      '70000000-0000-4000-8000-000000000005'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid,
      null::uuid,
      'individual'::public.participant_type,
      'Javier Morales Pérez',
      '+34610000081',
      'participante+081@demo.organizatorneo.test',
      null::jsonb,
      'cash'::public.registration_payment_method,
      now() - interval '10 days',
      now() - interval '12 days',
      now() - interval '12 days',
      '50000000-0000-4000-8000-000000000081'::uuid,
      now() - interval '12 days',
      0,
      now() - interval '12 days'
    ),
    (
      6,
      '70000000-0000-4000-8000-000000000006'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000001'::uuid,
      'team'::public.participant_type,
      'Club Pádel Axarquía',
      '+34610000001',
      'participante+001@demo.organizatorneo.test',
      '[{"name":"Carlos Medina"},{"name":"Laura Moreno"}]'::jsonb,
      'cash'::public.registration_payment_method,
      now() - interval '50 days',
      now() - interval '52 days',
      now() - interval '52 days',
      '50000000-0000-4000-8000-000000000001'::uuid,
      now() - interval '52 days',
      0,
      now() - interval '52 days'
    ),
    (
      7,
      '70000000-0000-4000-8000-000000000007'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000004'::uuid,
      'individual'::public.participant_type,
      'Nicolás Calvo Martín',
      '+34621000007',
      'nicolas.calvo@example.com',
      null::jsonb,
      'cash'::public.registration_payment_method,
      now() + interval '12 minutes',
      null::timestamptz,
      null::timestamptz,
      null::uuid,
      now() - interval '18 minutes',
      1,
      now() - interval '6 minutes'
    ),
    (
      8,
      '70000000-0000-4000-8000-000000000008'::uuid,
      '20000000-0000-4000-8000-000000000001'::uuid,
      '30000000-0000-4000-8000-000000000003'::uuid,
      'team'::public.participant_type,
      'Dúo Montes de Málaga',
      '+34621000008',
      'duo.montes@example.com',
      '[{"name":"Alicia Montes"},{"name":"Carlos Málaga"}]'::jsonb,
      'online'::public.registration_payment_method,
      now() - interval '1 day',
      null::timestamptz,
      null::timestamptz,
      null::uuid,
      now() - interval '2 days',
      0,
      now() - interval '2 days'
    )
) as requests(
  request_no,
  request_id,
  tournament_id,
  category_id,
  participant_type,
  display_name,
  contact_phone,
  contact_email,
  players,
  payment_method,
  expires_at,
  verified_at,
  consumed_at,
  registration_id,
  created_at,
  resend_count,
  last_email_sent_at
)
cross join request_secret;

-- ---------------------------------------------------------------------------
-- Brackets
-- ---------------------------------------------------------------------------

execute $function$
create function public.seed_participant(p_seed_no integer)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', format('40000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0')),
    'name', display_name
  )
  from public.seed_registration_entries
  where seed_no = p_seed_no
$$;
$function$;

execute $function$
create function public.seed_slot(p_seed_no integer)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'kind', 'participant',
    'id', format('40000000-0000-4000-8000-%s', lpad(seed_no::text, 12, '0')),
    'name', display_name
  )
  from public.seed_registration_entries
  where seed_no = p_seed_no
$$;
$function$;

execute $function$
create function public.seed_result(p_score_a integer, p_score_b integer, p_winner text)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object('scoreA', p_score_a, 'scoreB', p_score_b, 'winner', p_winner)
$$;
$function$;

execute $function$
create function public.seed_match_slot(p_label text, p_source_type text, p_match_id text)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'kind', 'placeholder',
    'label', p_label,
    'source', jsonb_build_object('type', p_source_type, 'matchId', p_match_id)
  )
$$;
$function$;

execute $function$
create function public.seed_group_slot(p_label text, p_group text, p_position integer)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'kind', 'placeholder',
    'label', p_label,
    'source', jsonb_build_object('type', 'group_qualifier', 'group', p_group, 'position', p_position)
  )
$$;
$function$;

insert into public.tournament_brackets (
  id,
  tournament_id,
  category_id,
  format,
  structure,
  participant_count,
  created_at,
  updated_at
)
values
  (
    '80000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'single_elimination',
    jsonb_build_object(
      'version', 2,
      'format', 'single_elimination',
      'options', jsonb_build_object('thirdPlace', true),
      'participants', jsonb_build_array(
        public.seed_participant(1), public.seed_participant(2),
        public.seed_participant(3), public.seed_participant(4),
        public.seed_participant(5), public.seed_participant(6),
        public.seed_participant(7), public.seed_participant(8)
      ),
      'body', jsonb_build_object(
        'kind', 'single_elimination',
        'rounds', jsonb_build_array(
          jsonb_build_object(
            'name', 'Cuartos de final',
            'matches', jsonb_build_array(
              jsonb_build_object('id', 'ko-r1-m1', 'slotA', public.seed_slot(1), 'slotB', public.seed_slot(8), 'result', public.seed_result(6, 3, 'A')),
              jsonb_build_object('id', 'ko-r1-m2', 'slotA', public.seed_slot(4), 'slotB', public.seed_slot(5), 'result', public.seed_result(4, 6, 'B')),
              jsonb_build_object('id', 'ko-r1-m3', 'slotA', public.seed_slot(2), 'slotB', public.seed_slot(7)),
              jsonb_build_object('id', 'ko-r1-m4', 'slotA', public.seed_slot(3), 'slotB', public.seed_slot(6))
            )
          ),
          jsonb_build_object(
            'name', 'Semifinales',
            'matches', jsonb_build_array(
              jsonb_build_object(
                'id', 'ko-r2-m1',
                'slotA', public.seed_match_slot('Ganador Cuartos 1', 'winner', 'ko-r1-m1'),
                'slotB', public.seed_match_slot('Ganador Cuartos 2', 'winner', 'ko-r1-m2')
              ),
              jsonb_build_object(
                'id', 'ko-r2-m2',
                'slotA', public.seed_match_slot('Ganador Cuartos 3', 'winner', 'ko-r1-m3'),
                'slotB', public.seed_match_slot('Ganador Cuartos 4', 'winner', 'ko-r1-m4')
              )
            )
          ),
          jsonb_build_object(
            'name', 'Final',
            'matches', jsonb_build_array(
              jsonb_build_object(
                'id', 'ko-r3-m1',
                'slotA', public.seed_match_slot('Ganador Semifinal 1', 'winner', 'ko-r2-m1'),
                'slotB', public.seed_match_slot('Ganador Semifinal 2', 'winner', 'ko-r2-m2')
              )
            )
          ),
          jsonb_build_object(
            'name', 'Tercer y cuarto puesto',
            'matches', jsonb_build_array(
              jsonb_build_object(
                'id', 'ko-third',
                'slotA', public.seed_match_slot('Perdedor Semifinal 1', 'loser', 'ko-r2-m1'),
                'slotB', public.seed_match_slot('Perdedor Semifinal 2', 'loser', 'ko-r2-m2')
              )
            )
          )
        )
      )
    ),
    8,
    now() - interval '1 day',
    now() - interval '2 hours'
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    'round_robin',
    jsonb_build_object(
      'version', 2,
      'format', 'round_robin',
      'options', jsonb_build_object('doubleRound', false),
      'participants', jsonb_build_array(
        public.seed_participant(21), public.seed_participant(22),
        public.seed_participant(23), public.seed_participant(24),
        public.seed_participant(25), public.seed_participant(26)
      ),
      'body', jsonb_build_object(
        'kind', 'round_robin',
        'rounds', jsonb_build_array(
          jsonb_build_object(
            'name', 'Jornada 1',
            'matches', jsonb_build_array(
              jsonb_build_object('id', 'rr-j1-m1', 'slotA', public.seed_slot(21), 'slotB', public.seed_slot(26), 'result', public.seed_result(6, 2, 'A')),
              jsonb_build_object('id', 'rr-j1-m2', 'slotA', public.seed_slot(22), 'slotB', public.seed_slot(25), 'result', public.seed_result(4, 6, 'B')),
              jsonb_build_object('id', 'rr-j1-m3', 'slotA', public.seed_slot(23), 'slotB', public.seed_slot(24), 'result', public.seed_result(6, 4, 'A'))
            )
          ),
          jsonb_build_object(
            'name', 'Jornada 2',
            'matches', jsonb_build_array(
              jsonb_build_object('id', 'rr-j2-m1', 'slotA', public.seed_slot(21), 'slotB', public.seed_slot(25), 'result', public.seed_result(5, 5, null)),
              jsonb_build_object('id', 'rr-j2-m2', 'slotA', public.seed_slot(26), 'slotB', public.seed_slot(24), 'result', public.seed_result(3, 6, 'B')),
              jsonb_build_object('id', 'rr-j2-m3', 'slotA', public.seed_slot(22), 'slotB', public.seed_slot(23), 'result', public.seed_result(6, 1, 'A'))
            )
          ),
          jsonb_build_object(
            'name', 'Jornada 3',
            'matches', jsonb_build_array(
              jsonb_build_object('id', 'rr-j3-m1', 'slotA', public.seed_slot(21), 'slotB', public.seed_slot(24)),
              jsonb_build_object('id', 'rr-j3-m2', 'slotA', public.seed_slot(25), 'slotB', public.seed_slot(23)),
              jsonb_build_object('id', 'rr-j3-m3', 'slotA', public.seed_slot(26), 'slotB', public.seed_slot(22))
            )
          )
        )
      )
    ),
    6,
    now() - interval '1 day',
    now() - interval '90 minutes'
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000003',
    'groups_knockout',
    jsonb_build_object(
      'version', 2,
      'format', 'groups_knockout',
      'options', jsonb_build_object('groupCount', 2, 'qualifiersPerGroup', 2),
      'participants', jsonb_build_array(
        public.seed_participant(41), public.seed_participant(42),
        public.seed_participant(43), public.seed_participant(44),
        public.seed_participant(45), public.seed_participant(46),
        public.seed_participant(47), public.seed_participant(48)
      ),
      'body', jsonb_build_object(
        'kind', 'groups_knockout',
        'groups', jsonb_build_array(
          jsonb_build_object(
            'name', 'Grupo A',
            'participants', jsonb_build_array(
              public.seed_participant(41), public.seed_participant(43),
              public.seed_participant(45), public.seed_participant(47)
            ),
            'rounds', jsonb_build_array(
              jsonb_build_object('name', 'Jornada 1', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g1-j1-m1', 'slotA', public.seed_slot(41), 'slotB', public.seed_slot(47), 'result', public.seed_result(6, 2, 'A')),
                jsonb_build_object('id', 'g1-j1-m2', 'slotA', public.seed_slot(43), 'slotB', public.seed_slot(45), 'result', public.seed_result(5, 5, null))
              )),
              jsonb_build_object('name', 'Jornada 2', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g1-j2-m1', 'slotA', public.seed_slot(41), 'slotB', public.seed_slot(45), 'result', public.seed_result(6, 3, 'A')),
                jsonb_build_object('id', 'g1-j2-m2', 'slotA', public.seed_slot(47), 'slotB', public.seed_slot(43), 'result', public.seed_result(2, 6, 'B'))
              )),
              jsonb_build_object('name', 'Jornada 3', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g1-j3-m1', 'slotA', public.seed_slot(41), 'slotB', public.seed_slot(43), 'result', public.seed_result(6, 4, 'A')),
                jsonb_build_object('id', 'g1-j3-m2', 'slotA', public.seed_slot(45), 'slotB', public.seed_slot(47), 'result', public.seed_result(6, 1, 'A'))
              ))
            )
          ),
          jsonb_build_object(
            'name', 'Grupo B',
            'participants', jsonb_build_array(
              public.seed_participant(42), public.seed_participant(44),
              public.seed_participant(46), public.seed_participant(48)
            ),
            'rounds', jsonb_build_array(
              jsonb_build_object('name', 'Jornada 1', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g2-j1-m1', 'slotA', public.seed_slot(42), 'slotB', public.seed_slot(48), 'result', public.seed_result(6, 0, 'A')),
                jsonb_build_object('id', 'g2-j1-m2', 'slotA', public.seed_slot(44), 'slotB', public.seed_slot(46), 'result', public.seed_result(3, 6, 'B'))
              )),
              jsonb_build_object('name', 'Jornada 2', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g2-j2-m1', 'slotA', public.seed_slot(42), 'slotB', public.seed_slot(46), 'result', public.seed_result(6, 4, 'A')),
                jsonb_build_object('id', 'g2-j2-m2', 'slotA', public.seed_slot(48), 'slotB', public.seed_slot(44), 'result', public.seed_result(2, 6, 'B'))
              )),
              jsonb_build_object('name', 'Jornada 3', 'matches', jsonb_build_array(
                jsonb_build_object('id', 'g2-j3-m1', 'slotA', public.seed_slot(42), 'slotB', public.seed_slot(44), 'result', public.seed_result(6, 3, 'A')),
                jsonb_build_object('id', 'g2-j3-m2', 'slotA', public.seed_slot(46), 'slotB', public.seed_slot(48), 'result', public.seed_result(6, 2, 'A'))
              ))
            )
          )
        ),
        'knockout', jsonb_build_array(
          jsonb_build_object(
            'name', 'Semifinales',
            'matches', jsonb_build_array(
              jsonb_build_object(
                'id', 'gko-r1-m1',
                'slotA', public.seed_group_slot('1.º Grupo A', 'Grupo A', 1),
                'slotB', public.seed_group_slot('2.º Grupo A', 'Grupo A', 2),
                'result', public.seed_result(6, 4, 'A')
              ),
              jsonb_build_object(
                'id', 'gko-r1-m2',
                'slotA', public.seed_group_slot('1.º Grupo B', 'Grupo B', 1),
                'slotB', public.seed_group_slot('2.º Grupo B', 'Grupo B', 2)
              )
            )
          ),
          jsonb_build_object(
            'name', 'Final',
            'matches', jsonb_build_array(
              jsonb_build_object(
                'id', 'gko-r2-m1',
                'slotA', public.seed_match_slot('Ganador Semifinal 1', 'winner', 'gko-r1-m1'),
                'slotB', public.seed_match_slot('Ganador Semifinal 2', 'winner', 'gko-r1-m2')
              )
            )
          )
        )
      )
    ),
    8,
    now() - interval '1 day',
    now() - interval '30 minutes'
  ),
  (
    '80000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000003',
    null,
    'single_elimination',
    jsonb_build_object(
      'version', 2,
      'format', 'single_elimination',
      'options', '{}'::jsonb,
      'participants', jsonb_build_array(
        public.seed_participant(101), public.seed_participant(102),
        public.seed_participant(103), public.seed_participant(104),
        public.seed_participant(105), public.seed_participant(106),
        public.seed_participant(107), public.seed_participant(108)
      ),
      'body', jsonb_build_object(
        'kind', 'single_elimination',
        'rounds', jsonb_build_array(
          jsonb_build_object('name', 'Cuartos de final', 'matches', jsonb_build_array(
            jsonb_build_object('id', 'ko-r1-m1', 'slotA', public.seed_slot(101), 'slotB', public.seed_slot(108), 'result', public.seed_result(1, 0, 'A')),
            jsonb_build_object('id', 'ko-r1-m2', 'slotA', public.seed_slot(104), 'slotB', public.seed_slot(105), 'result', public.seed_result(0, 1, 'B')),
            jsonb_build_object('id', 'ko-r1-m3', 'slotA', public.seed_slot(102), 'slotB', public.seed_slot(107), 'result', public.seed_result(1, 0, 'A')),
            jsonb_build_object('id', 'ko-r1-m4', 'slotA', public.seed_slot(103), 'slotB', public.seed_slot(106), 'result', public.seed_result(1, 0, 'A'))
          )),
          jsonb_build_object('name', 'Semifinales', 'matches', jsonb_build_array(
            jsonb_build_object(
              'id', 'ko-r2-m1',
              'slotA', public.seed_match_slot('Ganador Cuartos 1', 'winner', 'ko-r1-m1'),
              'slotB', public.seed_match_slot('Ganador Cuartos 2', 'winner', 'ko-r1-m2'),
              'result', public.seed_result(1, 0, 'A')
            ),
            jsonb_build_object(
              'id', 'ko-r2-m2',
              'slotA', public.seed_match_slot('Ganador Cuartos 3', 'winner', 'ko-r1-m3'),
              'slotB', public.seed_match_slot('Ganador Cuartos 4', 'winner', 'ko-r1-m4'),
              'result', public.seed_result(0, 1, 'B')
            )
          )),
          jsonb_build_object('name', 'Final', 'matches', jsonb_build_array(
            jsonb_build_object(
              'id', 'ko-r3-m1',
              'slotA', public.seed_match_slot('Ganador Semifinal 1', 'winner', 'ko-r2-m1'),
              'slotB', public.seed_match_slot('Ganador Semifinal 2', 'winner', 'ko-r2-m2'),
              'result', public.seed_result(1, 0, 'A')
            )
          ))
        )
      )
    ),
    8,
    now() - interval '31 days',
    now() - interval '30 days'
  );

drop function public.seed_group_slot(text, text, integer);
drop function public.seed_match_slot(text, text, text);
drop function public.seed_result(integer, integer, text);
drop function public.seed_slot(integer);
drop function public.seed_participant(integer);
drop table public.seed_registration_entries;

end;
$seed_data$;

-- Fail loudly if a future schema change leaves the development dataset partial.
do $$
begin
  if (select count(*) from public.tournaments) < 6 then
    raise exception 'Seed validation failed: tournaments are missing';
  end if;

  if (select count(*) from public.registrations) < 80 then
    raise exception 'Seed validation failed: expected at least 80 registrations';
  end if;

  if (select count(distinct status) from public.registrations) < 5 then
    raise exception 'Seed validation failed: not all registration statuses are represented';
  end if;

  if (select count(distinct status) from public.tournaments) < 5 then
    raise exception 'Seed validation failed: not all tournament statuses are represented';
  end if;

  if (select count(distinct format) from public.tournament_brackets) < 3 then
    raise exception 'Seed validation failed: not all bracket formats are represented';
  end if;
end
$$;

select set_config('app.bypass_registration_window', 'off', false);
