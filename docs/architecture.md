# Arquitectura

## Objetivo

La arquitectura debe ser facil de mantener por una persona y facil de extender con
ayuda de IA. Eso implica archivos pequenos, limites claros entre capas y reglas de
negocio fuera de componentes React.

## Stack Actual

Base recomendada:

- Next.js App Router.
- React.
- TypeScript en modo estricto.
- Supabase para Postgres, auth, storage y RLS.
- Stripe para pagos online.
- Tailwind CSS para estilos.
- Zod para validacion.
- pnpm como package manager.
- shadcn/ui como base del sistema de componentes.

Herramientas recomendadas:

- `react-hook-form`: formularios largos y validacion integrada.
- `lucide-react`: iconos consistentes.
- `vitest`: tests unitarios de dominio.
- `@testing-library/react`: tests de componentes cuando tenga sentido.
- `playwright`: pruebas de flujos criticos y screenshots de frontend.
- `prettier`: formato consistente si se decide estandarizarlo.

Pendiente de decidir:

- ORM/query layer adicional: por defecto no se recomienda anadir ORM encima de
  Supabase hasta que haya dolor real.
- Stripe real queda pausado hasta terminar la limpieza legacy. El modulo de
  pagos puede limpiar infraestructura, pero no debe activar nuevos flujos de
  checkout o webhook todavia.

## Estructura Objetivo

```txt
src/
  app/
    (public)/
    (organizer)/
    api/
  components/
    ui/
    layout/
  modules/
    auth/
      server/
      ui/
    tournaments/
      domain/
      schemas/
      server/
      ui/
    registrations/
      domain/
      schemas/
      server/
      ui/
    payments/
      domain/
      server/
  lib/
    supabase/
    stripe/
    utils/
  shared/
    locations/
  types/
```

## Capas

### `app`

Responsabilidad:

- Rutas Next.
- Layouts.
- Carga minima de datos para componer paginas.
- Invocar modulos, no contener reglas de negocio.

Regla:

- Una pagina no deberia contener calculos complejos, validaciones largas ni llamadas RPC dispersas.

### `modules/*/domain`

Responsabilidad:

- Tipos de dominio.
- Reglas puras.
- Maquinas de estado simples.
- Calculos: cupos, estados visibles, permisos de accion, precios.

Regla:

- No importa React.
- No importa Supabase.
- No lee variables de entorno.
- Debe ser testeable con `vitest`.

### `modules/*/schemas`

Responsabilidad:

- Schemas Zod de entrada.
- Parsers de formularios.
- Normalizacion basica de input.

Regla:

- La misma validacion debe poder reutilizarse en server actions, rutas API y tests.

### `modules/*/server`

Responsabilidad:

- Server actions.
- Queries.
- Mutations.
- Casos de uso.
- Adaptadores a Supabase o Stripe.

Regla:

- Los componentes cliente no deben llamar directamente a Supabase para acciones de negocio criticas.
- Los errores de Supabase/Stripe deben mapearse a errores de aplicacion estables.

### `modules/*/ui`

Responsabilidad:

- Componentes especificos del modulo.
- Formularios.
- Tablas.
- Estados visuales.

Regla:

- La UI recibe datos preparados y llama acciones de alto nivel.
- La UI no decide reglas criticas de permisos o transiciones de estado.

### `components/ui`

Responsabilidad:

- Button.
- Input.
- Select.
- Textarea.
- Badge.
- Card solo cuando represente una unidad real.
- Dialog.
- Table.
- EmptyState.
- FieldError.

Regla:

- Componentes genericos, sin conocimiento de torneos o pagos.
- Consultar `docs/ui-system.md` antes de crear nuevos patrones visuales.

## Flujo De Dependencias

```txt
app -> modules/*/ui -> modules/*/server -> lib/supabase | lib/stripe
                 \-> modules/*/domain
modules/*/server -> modules/*/domain
modules/*/schemas -> modules/*/domain
```

No permitido:

```txt
domain -> React
domain -> Supabase
ui -> SQL/RPC directo para acciones criticas
app -> logica larga de negocio
```

## Estado Actual De Modulos

La refactorizacion actual deja el codigo organizado por modulos sin cambiar las
reglas de negocio principales:

- `src/modules/tournaments/domain`: reglas puras y formateadores de torneos.
- `src/modules/tournaments/schemas`: contratos Zod y parsers de formularios de torneos.
- `src/modules/tournaments/server`: automatizacion, server actions y queries de torneos.
- `src/modules/registrations/domain`: reglas puras de inscripciones, como telefono.
- `src/modules/registrations/server`: emails transaccionales de inscripciones.
- `src/modules/organizer/domain`: tipos y constantes del panel de gestion.
- `src/modules/payments/domain`: contratos base de pagos.
- `src/modules/payments/server`: adaptador Stripe.
- `src/shared/api`: contratos transversales de errores HTTP.
- `src/shared/locations`: datos compartidos de ubicacion.

`src/lib` queda reservado para infraestructura transversal:

- Supabase clients.
- Stripe client.
- Utilidades tecnicas genericas.

## Plan Activo De Limpieza

Hasta cerrar el plan activo de `docs/roadmap.md`, la arquitectura esta en modo
limpieza:

- No se anaden funcionalidades nuevas.
- Se eliminan restos legacy y duplicaciones.
- Se mantienen los flujos existentes.
- Se prioriza que los casos de uso sean testeables sin React ni HTTP.
- La compatibilidad con estados legacy debe quedar documentada y aislada.

## Base De Datos

Como no hay produccion, la base de datos se gestiona con una baseline limpia:

```txt
supabase/migrations/20260528190000_initial_schema.sql
```

Ese archivo es la fuente de verdad de la base de datos actual del proyecto. Si
se cambia una regla de negocio persistida, debe reflejarse ahi y en
`docs/database.md`.

Las migraciones incrementales de desarrollo estan archivadas fuera de
`supabase/migrations` para que no se apliquen en resets nuevos. El contrato de
tablas, RPCs y permisos esta documentado en `docs/database.md`.

Principios:

- RLS activado en tablas sensibles.
- Funciones SQL solo para operaciones que necesiten atomicidad fuerte o permisos especiales.
- Reglas duplicadas entre SQL y TypeScript solo cuando sea inevitable; si se duplican, se documentan.
- Nombres de funciones y errores estables.

## Errores

Se debe evitar mapear strings sueltos de SQL como contrato principal en
componentes.

Patron actual:

- Los endpoints devuelven `{ error, code }` en errores controlados.
- `src/shared/api/errors.ts` contiene codigos transversales.
- Modulos con errores propios pueden definir codigos de dominio, como
  `src/modules/organizer/domain/errors.ts`.
- La UI traduce codigos a mensajes y mantiene fallback por texto solo por
  compatibilidad con errores no catalogados.

Regla:

- Si se anade un error de negocio nuevo, primero se cataloga con un codigo
  estable y despues se traduce en UI.
- Stripe no debe introducir mensajes crudos de proveedor en componentes.

## Testing

Minimo esperado:

- Tests unitarios para dominio:
  - estados de torneo,
  - estados de inscripcion,
  - calculo de cupos,
  - calculo de precio,
  - permisos de acciones.
- Tests de integracion ligera para server actions cuando sea viable.
- Playwright:
  - smoke publico de homepage y login,
  - crear torneo,
  - publicar torneo,
  - inscribirse,
  - pagar con Stripe en modo test,
  - gestionar inscripcion.

## Criterios De Calidad

Antes de cerrar una fase:

- `npm run lint` debe pasar.
- `npm run typecheck` debe pasar.
- Tests relevantes deben pasar.
- No deben quedar componentes enormes si se ha tocado esa zona.
- La UI debe probarse en desktop y movil.
