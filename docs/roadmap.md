# Roadmap De Refactorizacion

## Plan Activo: Cierre Legacy Sin Funcionalidades Nuevas

Objetivo:

- Eliminar deuda legacy restante antes de anadir nuevas features.
- Mantener el comportamiento actual salvo cuando se retire compatibilidad legacy
  documentada.
- Dejar la arquitectura preparada para crecer sin duplicar validaciones,
  handlers grandes ni contratos por texto.

Reglas de esta etapa:

- No implementar Stripe real.
- No anadir pantallas nuevas.
- No ampliar producto.
- No cambiar UX salvo ajustes necesarios para conservar comportamiento con una
  arquitectura mas limpia.
- Cada fase debe cerrar con `pnpm lint`, `pnpm typecheck`, `pnpm test` y los
  e2e que correspondan.

### Fase A: Congelar Base Y Documentar Estado

Estado: completada.

Entregables:

- README propio del proyecto, no boilerplate de Next.
- Roadmap actualizado para reflejar que el siguiente trabajo es limpieza, no
  features.
- Lista explicita de deuda legacy restante.
- Validacion base registrada.

No incluye:

- Cambios de comportamiento.
- Refactors de codigo productivo.

Deuda legacy restante detectada:

- Emails transaccionales HTML construidos con interpolacion manual de strings.
- Mapeos de errores que todavia dependen de `error.message.includes(...)`.
- Validacion de creacion de torneo duplicada entre UI, server action y schemas.
- Route handlers de inscripciones y gestion que mezclan HTTP, auth, RPC,
  transformacion de datos y efectos secundarios.
- Archivos de dominio/UI por encima del tamano objetivo.
- Estados legacy de inscripcion retirados de tipos y baseline:
  `pending`, `paid`, `pending_verification`.
- Logica de sesion Supabase de cliente duplicada entre navbar, home y login.
- Stripe migrado a factory lazy; ya no se instancia al importar
  `src/lib/stripe.ts`.
- Tipos de base de datos generados manualmente o pendientes de regenerar desde
  Supabase CLI.

### Fase B: Seguridad Y Errores Legacy

Objetivo:

- Eliminar contratos fragiles y riesgos historicos sin cambiar flujos.

Tareas:

- Escapar datos interpolados en emails HTML.
- Testear emails con datos de usuario, torneo y categoria.
- Reducir dependencia de mensajes SQL crudos donde sea viable.
- Mantener fallbacks por texto solo como compatibilidad temporal documentada.

Estado: completada.

Resultado:

- Emails transaccionales renderizados desde funciones puras testeables.
- Datos dinamicos escapados antes de interpolarse en HTML.
- Tests unitarios para render seguro de emails.
- UI de errores de gestion migrada a catalogo por `ManagementErrorCode`.
- UI publica de inscripcion, verificacion y cancelacion migrada a catalogos por
  `AppErrorCode`.
- Errores SQL conocidos de inscripciones centralizados en
  `src/modules/registrations/server/errors.ts`.
- Route handlers de inscripciones dejan de hacer matching directo contra
  literales SQL salvo en el catalogo central.

### Fase C: Contratos De Validacion Unicos

Objetivo:

- Evitar que UI, server action y SQL tengan validaciones divergentes.

Tareas:

- Completar schemas Zod de creacion de torneo.
- Reutilizar parsers desde server action y tests.
- Mantener validacion UI como ayuda visual, no como fuente de verdad separada.
- Anadir tests de fechas, categorias, precios, premios y cupos.

Estado: completada para creacion de torneo.

Resultado:

- Schema completo de creacion de torneo en
  `src/modules/tournaments/schemas/create-tournament.ts`.
- Parser de `FormData` reutilizable desde server action.
- `createTournament` deja de contener la validacion larga de campos.
- Tests unitarios del contrato de creacion de torneo.

Pendiente fuera de esta fase:

- La validacion visual del wizard sigue existiendo para experiencia de usuario,
  pero la fuente de verdad server ya es el schema.

### Fase D: Use Cases Server

Objetivo:

- Separar route handlers de casos de uso.

Tareas:

- Extraer casos de uso en inscripciones publicas.
- Extraer casos de uso en gestion del organizador.
- Dejar handlers HTTP como validacion de request + llamada al caso de uso +
  serializacion de response.
- Testear casos de uso con clientes Supabase/proveedores mockeables.

Estado: completada.

Resultado:

- Inscripciones publicas separan route handlers de use cases para crear
  solicitud, reenviar verificacion, verificar solicitud y cancelar inscripcion.
- Acciones internas del organizador separan validacion/auth de mutaciones RPC.
- Tests unitarios anadidos para use cases de gestion.
- Route handlers publicos de inscripciones quedan por debajo de 50 lineas cada
  uno.

### Fase E: Dominio Y Estados Legacy

Objetivo:

- Reducir compatibilidad legacy a un borde controlado.

Tareas:

- Dividir archivos de dominio grandes por responsabilidad.
- Retirar de la baseline y de los tipos los estados legacy de inscripcion:
  `pending`, `paid`, `pending_verification`.
- Mover reglas de negocio que vivan en UI hacia `domain`.

Estado: completada.

Resultado:

- Estados legacy de inscripcion retirados de `registration_status` en la
  baseline.
- Tipos TypeScript actualizados para aceptar solo estados actuales.
- Reglas y tests de organizador actualizados a `confirmed`,
  `pending_cash_validation` y `pending_online_payment`.
- RPC SQL antigua `create_public_registration` eliminada de la baseline.
- La documentacion de base de datos refleja que no hay compatibilidad legacy de
  datos porque no existe produccion que preservar.

### Fase F: Pagos Como Infraestructura Limpia, Sin Activar Feature

Objetivo:

- Dejar `payments` listo para una feature futura sin habilitar Stripe real.

Tareas:

- Cambiar Stripe a factory lazy con error explicito si faltan env vars.
- Evitar instancias de proveedor al importar modulos.
- Documentar puertos/adaptadores esperados para checkout y webhook futuros.
- No crear endpoints publicos nuevos de pago en esta fase.

Estado: completada.

Resultado:

- `src/lib/stripe.ts` exporta `getStripeClient()`.
- Stripe ya no se instancia al importar modulos.
- Si falta `STRIPE_SECRET_KEY`, el error es explicito y ocurre solo al solicitar
  el cliente.
- `src/modules/payments/server` re-exporta la factory, no una instancia viva.
- No se han creado endpoints ni pantallas nuevas de pago.

### Fase G: Verificacion De Regresion

Objetivo:

- Asegurar que la limpieza no rompio flujos existentes.

Tareas:

- Mantener smoke publico.
- Anadir tests de regresion solo para flujos ya existentes.
- Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y
  `pnpm test:e2e`.

Estado: completada.

Resultado:

- `pnpm lint` pasa.
- `pnpm typecheck` pasa.
- `pnpm test` pasa con 15 archivos y 41 tests.
- `pnpm build` pasa.
- `pnpm test:e2e` pasa con 4 tests en Chromium desktop y mobile.

Nota:

- `pnpm test:e2e` necesita abrir un servidor local; en sandbox requiere
  permisos fuera del sandbox.

## Roadmap Historico

## Fase 1: Documentacion Y Decisiones

Objetivo:

- Dejar claro el producto.
- Definir arquitectura objetivo.
- Definir reglas para trabajar con IA.
- Identificar preguntas abiertas antes de tocar partes criticas.

Entregables:

- `docs/product.md`
- `docs/architecture.md`
- `docs/ai-guidelines.md`
- `docs/roadmap.md`

Estado: completada.

## Fase 2: Tooling Y Calidad

Objetivo:

- Preparar el proyecto para refactorizar con seguridad.

Tareas propuestas:

- Validar `tsconfig` con Next 16.
- Hacer que `pnpm lint` pase.
- Anadir `typecheck`.
- Decidir e instalar herramientas:
  - `vitest`
  - `playwright`
  - `lucide-react`
  - `react-hook-form`
  - `@hookform/resolvers`
  - `shadcn/ui`
- Crear scripts:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`

Estado: completada.

Resultado:

- Proyecto migrado a `pnpm`.
- `shadcn/ui` inicializado con preset `nova` y base Radix.
- Scripts disponibles:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm build`
- Vitest configurado.
- Playwright configurado.

No incluye:

- Redisenar pantallas.
- Cambiar schema de base de datos.

## Fase 3: Sistema UI Base

Objetivo:

- Crear una base visual consistente antes de rehacer pantallas.

Tareas propuestas:

- Definir tokens visuales: colores, tipografia, radios, sombras, spacing.
- Crear componentes `components/ui`.
- Crear layout publico y layout organizador.
- Redisenar navbar/footer si siguen existiendo.
- Crear estados comunes: loading, empty, error, success.

Estado: completada.

Resultado:

- Tokens visuales base definidos en `src/app/globals.css`.
- Componentes UI base creados en `src/components/ui`.
- Layouts base creados en `src/components/layout`.
- `Navbar` y `Footer` actualizados al sistema visual nuevo.
- Documentacion del sistema UI creada en `docs/ui-system.md`.
- Se elimina el puente de clases globales legacy. Las pantallas antiguas que
  dependan de esas clases quedan pendientes de migracion.

No incluye:

- Cambiar logica de negocio.
- Integrar Stripe.

## Fase 4: Estructura Modular Limpia

Objetivo:

- Separar definitivamente app routes, UI, dominio, schemas y server actions.
- Dejar de trabajar sobre pantallas legacy grandes.
- Crear shells modulares para los flujos principales antes de tocar schema.

Tareas propuestas:

- Crear estructura final de `src/modules`.
- Mover reglas puras existentes desde `src/lib/tournaments` a modulos.
- Crear contratos base para:
  - torneos,
  - inscripciones,
  - pagos,
  - gestion del organizador.
- Definir convenciones de imports.
- Marcar rutas/pantallas legacy que se reemplazaran.
- Empezar migracion por una pantalla concreta, no por parches globales.

Estado: completada.

Resultado:

- `src/lib` queda reducido a infraestructura transversal.
- Reglas de torneos movidas a `src/modules/tournaments/domain`.
- Schemas/parsers de creacion de torneo movidos a `src/modules/tournaments/schemas`.
- Automatizacion y rutas de transicion movidas a `src/modules/tournaments/server`.
- Reglas de inscripciones movidas a `src/modules/registrations`.
- Tipos del panel de organizador movidos a `src/modules/organizer`.
- Contratos base de pagos creados en `src/modules/payments`.
- Datos de ubicacion movidos a `src/shared/locations`.

No incluye:

- Cambiar reglas de negocio.
- Cambiar schema de Supabase.

## Fase 5: Schema Supabase Limpio

Objetivo:

- Sustituir migraciones de desarrollo por una baseline coherente.

Tareas propuestas:

- Disenar tablas definitivas del MVP.
- Definir enums.
- Definir RLS.
- Definir funciones SQL necesarias.
- Definir storage buckets.
- Documentar resets locales.

Decisiones confirmadas:

- Habra pago en efectivo ademas de Stripe.
- La cancelacion publica estara permitida antes del cierre de inscripciones.
- No habra comision de plataforma al principio.

Estado: completada como baseline tecnica.

Resultado:

- Baseline unica creada en `supabase/migrations/20260528190000_initial_schema.sql`.
- Migraciones incrementales antiguas retiradas del arbol activo.
- Trigger de alta de usuario documentado e incluido en la baseline.
- Permisos endurecidos al final de la baseline:
  - lectura publica limitada por RLS,
  - acciones de organizador para `authenticated`,
  - automatizacion para `service_role`.
- Contrato de base de datos documentado en `docs/database.md`.

No incluye:

- Cambiar reglas de negocio.
- Integrar Stripe completo.
- Eliminar estados legacy de inscripcion.

## Fase 6: Modulo Torneos

Objetivo:

- Rehacer creacion, publicacion, explorador y pagina publica con arquitectura modular.

Tareas propuestas:

- `modules/tournaments/domain`
- `modules/tournaments/schemas`
- `modules/tournaments/server`
- `modules/tournaments/ui`
- Tests unitarios de estados, cupos y publicacion.

Estado: completada.

Resultado:

- Server action de creacion movida a `src/modules/tournaments/server`.
- Read models de torneos creados en `src/modules/tournaments/domain`.
- Queries de explorador, pagina publica e inscripcion movidas a
  `src/modules/tournaments/server`.
- `/explorar` deja de llamar a Supabase desde el cliente.
- `/torneos/[id]` deja de contener queries Supabase directas.
- `/torneo/[id]/inscribirse` deja de contener queries Supabase directas.
- Helpers de resumen de precio/cupos/categorias movidos a dominio.
- Tests unitarios anadidos para resumenes de torneos.
- UI de creacion movida a `src/modules/tournaments/ui/create-tournament`.
- `src/app/crear-torneo/page.tsx` queda como composicion ligera.
- Formulario legacy local eliminado de `src/app/crear-torneo`.
- Wizard de creacion dividido en hook, sidebars, navegacion y pasos pequenos.
- Archivos principales del wizard quedan por debajo de 300 lineas.
- UI de explorador movida a `src/modules/tournaments/ui/explore-tournaments`.
- UI de pagina publica movida a `src/modules/tournaments/ui/public-tournament`.
- `/explorar` y `/torneos/[id]` quedan como wrappers de ruta.
- Boton de compartir movido al modulo de torneos y adaptado al sistema UI base.
- El dominio de torneos deja de devolver clases CSS para estados publicos; ahora
  devuelve estado semantico y la UI decide el componente visual.
- Explorador y pagina publica dejan de depender de clases globales legacy
  (`btn-*`, `card`, `input`, `container-custom`, `section-spacing`).

## Fase 7: Modulo Inscripciones

Objetivo:

- Rehacer flujo publico de inscripcion sin cuenta.

Tareas propuestas:

- Solicitud de inscripcion.
- Validacion de email.
- Control de duplicados.
- Cancelacion publica si se confirma como requisito.
- Tests de dominio.

Estado: completada.

Resultado:

- UI publica de inscripcion movida a
  `src/modules/registrations/ui/public-registration`.
- `/torneo/[id]/inscribirse` queda como wrapper de ruta.
- Flujo de verificacion movido a `src/modules/registrations/ui/verification`.
- Flujo de cancelacion movido a `src/modules/registrations/ui/cancellation`.
- `/inscripcion/verificar` y `/inscripcion/cancelar` quedan como wrappers de ruta.
- Formulario publico de inscripcion partido en hook, secciones y panel de solicitud creada.
- Handlers API de solicitud, reenvio y verificacion movidos a
  `src/modules/registrations/server`.
- Cancelacion publica movida a route handler modular
  `src/modules/registrations/server/cancel-public-registration-route.ts`.
- Rutas `app/api/public-registration-*` quedan como exports ligeros.
- Vistas movidas dejan de depender de clases globales legacy
  (`btn-*`, `card`, `input`, `label`, `container-custom`, `section-spacing`).
- Tests unitarios anadidos para helpers de presentacion de inscripcion,
  verificacion y cancelacion publica.
- Verificacion y cancelacion migradas a componentes UI base y variantes
  semanticas.

## Fase 8: Modulo Pagos

Objetivo:

- Integrar Stripe de forma limpia desde el MVP.

Tareas propuestas:

- Crear checkout session o payment intent segun decision tecnica.
- Webhook de Stripe.
- Estados de pago.
- Reconciliacion de inscripciones.
- Pantallas de resultado.
- Tests y flujo Playwright si es viable.

Estado: pendiente.

Nota:

- Se mantiene pendiente hasta que la refactorizacion base quede cerrada. Stripe
  sigue dentro del MVP, pero no se implementara como feature nueva antes de
  completar la limpieza estructural.

## Fase 9: Panel De Gestion

Objetivo:

- Rehacer el panel del organizador para gestionar torneos, inscripciones y pagos.

Tareas propuestas:

- Dashboard de torneos.
- Panel de torneo.
- Tabla de participantes.
- Filtros por estado.
- Acciones segun permisos.
- Resumen de pagos.

Estado: completada.

Resultado:

- `/torneo/[id]/gestionar` queda como wrapper de ruta con autenticacion, carga
  de datos y composicion de layout.
- Query del dashboard movida a `getManagedTournamentDashboard` en
  `src/modules/organizer/server/queries.ts`.
- UI del panel movida a `src/modules/organizer/ui/manage-dashboard`.
- `manage-dashboard.tsx` deja de ser una pantalla monolitica y queda como
  orquestador pequeno.
- Panel dividido en cabecera, metricas, tabs, configuracion, resumen operativo,
  grupos de inscripciones, filas y acciones por inscripcion.
- Reglas derivadas, labels, formateadores y mapeo de errores separados en
  helpers pequenos.
- La UI del panel deja de llamar a Supabase directamente; las mutaciones pasan
  por endpoints internos del modulo organizador.
- Rutas API internas del organizador quedan como exports ligeros desde `app/api`.
- Panel migrado a componentes UI base (`Button`, `Badge`, `Card`, `Alert`,
  `Input`, `Textarea`, `Table`, `Label`) y a iconos `lucide-react`.
- Tests unitarios anadidos para reglas y labels del panel de gestion.
- Vitest alineado con el alias `@/` usado por TypeScript y Next.
- `/mis-torneos` deja de ser una pantalla monolitica y queda como wrapper de
  ruta.
- Query y composicion del resumen de torneos movidas a `src/modules/organizer`.
- Vista `Mis torneos` movida a `src/modules/organizer/ui/my-tournaments`.
- Boton legacy de copiar enlace eliminado y recreado dentro del modulo.
- Tests unitarios anadidos para metricas, cupos y agrupacion de torneos del
  organizador.

## Fase 10: Limpieza Final

Objetivo:

- Eliminar codigo legacy y dejar el proyecto consistente.

Tareas propuestas:

- Borrar rutas antiguas.
- Borrar tipos duplicados.
- Borrar SQL obsoleto.
- Revisar docs.
- Ejecutar lint, typecheck, tests y e2e.

Estado: completada.

Resultado:

- `/` movida a `src/modules/marketing/ui/home-page.tsx`.
- `/login` movida a `src/modules/auth/ui/login-page.tsx`.
- Portada y login migrados a componentes UI base.
- Eliminadas las ultimas referencias a clases legacy en `src/app`, `src/modules`
  y `src/components` (`btn-*`, `container-custom`, `section-spacing`, `card`,
  `input`, `label`, `textarea`, `switch`).
- Rutas antiguas del flujo de creacion por pasos eliminadas:
  `/torneo/[id]/detalles`, `/estructura`, `/categorias`, `/cupos`, `/pagos` y
  `/publicar`.
- Helper interno `legacy-routes` eliminado.
- Documentacion de arquitectura, UI y roadmap revisada para reflejar el estado
  actual.
- Validacion completa ejecutada antes de cerrar la fase:
  `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` y `pnpm build`.

Siguiente fase historica:

- Pausada. No se implementaran pagos reales con Stripe hasta completar el plan
  activo de cierre legacy sin funcionalidades nuevas.
