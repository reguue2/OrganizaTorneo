# Guia Para Trabajar Con IA

## Objetivo

Este proyecto debe estar organizado para que una IA pueda entender y modificar una
parte concreta sin romper flujos alejados.

## Reglas De Trabajo

- No hacer cambios grandes sin actualizar o consultar `docs/architecture.md`.
- No meter reglas de negocio dentro de componentes React.
- No llamar directamente a Supabase desde componentes cliente para acciones criticas.
- No duplicar validaciones sin documentarlo.
- No crear archivos gigantes.
- No mezclar rediseño visual, schema de base de datos y reglas de negocio en el mismo cambio salvo fase planificada.
- No reintroducir clases globales legacy como `btn-primary`, `card`, `input` o `container-custom`.

## Tamano Recomendado

Guia orientativa:

- Componente UI generico: menos de 200 lineas.
- Componente de pantalla: idealmente menos de 300 lineas.
- Archivo de dominio: menos de 300 lineas.
- Server action/use case: menos de 250 lineas.

Si un archivo supera mucho esos limites, debe existir una razon clara.

## Como Pedir Cambios A La IA

Buenas peticiones:

- "Refactoriza solo el modulo de torneos siguiendo `docs/architecture.md`."
- "Anade tests unitarios para calculo de cupos sin tocar UI."
- "Rediseña la pagina publica del torneo usando los componentes existentes."
- "Crea el use case de inscripcion sin modificar schema."

Peticiones que conviene evitar:

- "Arregla todo."
- "Cambia el dashboard y tambien los pagos."
- "Haz el frontend mas bonito" sin indicar pantalla y objetivo.

## Checklist Antes De Implementar

Antes de tocar codigo, confirmar:

- Que fase esta activa.
- Que archivos/modulos se pueden tocar.
- Que comportamiento no debe cambiar.
- Que comandos se van a usar para verificar.

## Definicion De Hecho

Un cambio esta terminado cuando:

- Cumple la fase acordada.
- No deja deuda nueva obvia.
- Pasa lint y TypeScript, salvo bloqueo explicado.
- Incluye tests si cambia reglas de negocio.
- Mantiene la documentacion relevante actualizada.

## Notas De Arquitectura Para IA

- `domain` es puro.
- `schemas` valida entradas.
- `server` habla con Supabase/Stripe.
- `ui` presenta datos y llama acciones.
- `app` compone rutas.

Si una tarea no encaja en esa estructura, hay que parar y documentar la decision.
