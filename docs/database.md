# Base De Datos

## Estado

El proyecto esta en desarrollo y no conserva datos reales. La base de datos se
gestiona desde una baseline unica:

- `supabase/migrations/20260528190000_initial_schema.sql`

No se deben usar dumps ni migraciones legacy como referencia operativa. Supabase
solo debe aplicar archivos dentro de `supabase/migrations`.

## Modulos De Datos

### Organizador

- `users`: perfil del organizador vinculado a `auth.users`.
- Trigger `on_auth_user_created`: crea `public.users` cuando se crea un usuario
  de Supabase Auth.

### Torneos

- `tournaments`: datos principales del torneo, estado, visibilidad, precio global
  y configuracion sin categorias.
- `categories`: categorias de un torneo cuando `has_categories = true`.

Regla de categorias:

- Si `has_categories = true`, el torneo debe tener al menos 1 categoria.
- La regla esta validada en TypeScript y tambien en las funciones SQL de la
  baseline.

Estados de torneo:

- `draft`
- `published`
- `closed`
- `finished`
- `cancelled`

### Inscripciones

- `registration_requests`: solicitud temporal antes de verificar email.
- `participants`: datos publicos del participante o equipo.
- `registrations`: inscripcion confirmada o pendiente.

Estados activos del flujo actual:

- `pending_cash_validation`
- `pending_online_payment`
- `confirmed`
- `cancelled`
- `expired`

Los estados legacy `pending`, `paid` y `pending_verification` se han retirado de
la baseline porque el proyecto no conserva datos reales de produccion.

### Pagos

- `payments`: pagos asociados a una inscripcion.

Estados de pago:

- `pending`
- `paid`
- `refunded`

Stripe todavia no esta integrado como flujo completo; el schema conserva
`stripe_payment_intent_id` para la fase de pagos.

### Storage

- Bucket `tournament-posters`: carteles publicos de torneo.
- El bucket y sus policies estan definidos en la baseline.
- Setup operativo documentado en `docs/storage.md`.

## RPC Publicas

### Publicas anonimas

- `cancel_public_registration`: cancelacion publica con referencia y token/codigo.

### Organizador autenticado

- `create_and_publish_tournament`
- `publish_tournament`
- `set_tournament_management_status`
- `update_tournament_management_config`
- `approve_cash_registration`
- `mark_online_registration_paid`
- `cancel_registration_by_organizer`

### Service role

- `create_public_registration_request`
- `resend_public_registration_request`
- `verify_public_registration_request`
- `apply_automatic_state_transitions`
- `run_tournament_automation_job`

## Seguridad

La baseline endurece permisos al final del SQL:

- `anon` solo puede leer torneos y categorias visibles por RLS.
- `authenticated` puede leer sus datos operativos segun RLS.
- Las escrituras criticas pasan por RPC.
- La automatizacion queda para `service_role`.
- `registration_requests` no se expone directamente al cliente.
- `poster_url` es nullable; el cartel del torneo es opcional en el MVP.

## Pendiente

No se cambia logica de negocio en esta fase. Queda pendiente para fases
posteriores:

- Eliminar estados antiguos de inscripcion si se confirma que ya no hay datos
  que los necesiten.
- Crear el flujo real de Stripe y webhooks.
- Generar `src/types/database.ts` desde la baseline cuando este disponible
  Supabase CLI.
