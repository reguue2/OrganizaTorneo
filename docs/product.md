# Producto

## Objetivo

Organiza Torneo es una aplicacion para crear, publicar y gestionar torneos locales
o de pueblo. Debe servir para torneos de cualquier actividad, no solo deportivos.

La prioridad es que el organizador pueda gestionar un torneo sin hojas sueltas,
mensajes desordenados ni cobros dificiles de seguir. Para participantes, la
experiencia debe ser rapida, clara y sin necesidad de crear cuenta.

## Decisiones Confirmadas

- Idioma inicial: espanol.
- Publico principal: organizadores de torneos locales.
- Participantes: se inscriben sin cuenta.
- Organizadores: necesitan cuenta para crear y gestionar torneos.
- Pagos: Stripe debe formar parte del MVP.
- Pagos locales: se permite Stripe y efectivo.
- Torneos privados: se permiten torneos ocultos del explorador y accesibles por enlace.
- Imagen/cartel: no sera obligatorio en el MVP.
- Cancelacion publica: permitida antes del cierre de inscripciones.
- Comision de plataforma: no se aplica al principio; Stripe normal primero.
- Estado actual: desarrollo total, sin datos reales que preservar.
- Base de datos: se puede plantear un schema limpio y resetear migraciones de dev.
- Refactorizacion: por fases, con decisiones explicitas antes de tocar partes grandes.

## MVP

El primer MVP profesional debe cubrir:

- Autenticacion de organizadores.
- Creacion de torneo.
- Torneos con o sin categorias.
- Los torneos con categorias requieren al menos 1 categoria.
- Publicacion de torneo.
- Pagina publica del torneo.
- Explorador publico de torneos.
- Inscripcion publica sin cuenta.
- Validacion de email para inscripciones.
- Pago online con Stripe desde el MVP.
- Opcion de pago en efectivo para torneos locales.
- Gestion de participantes e inscripciones.
- Estados claros del torneo: borrador, publicado, cerrado, finalizado, cancelado.
- Estados claros de inscripcion: pendiente, pendiente de pago, confirmada, cancelada, caducada.
- Emails transaccionales basicos.

## Principios UX

- La app debe sentirse facil, directa y fiable.
- Las pantallas del organizador deben ser operativas, no de marketing.
- El participante debe entender siempre:
  - cuanto cuesta,
  - en que se esta inscribiendo,
  - que pasa despues de pagar o validar,
  - como consultar o cancelar si aplica.
- El organizador debe ver rapidamente:
  - plazas disponibles,
  - inscritos confirmados,
  - pagos pendientes,
  - alertas importantes,
  - acciones disponibles segun estado.

## No Objetivos Iniciales

Estas ideas no entran en el MVP salvo decision explicita:

- App movil nativa.
- Multiidioma.
- Gestion avanzada de brackets/cuadros competitivos.
- Chat interno.
- Rankings globales.
- Marketplace complejo con reviews.
- Roles de equipo dentro de una organizacion.

## Preguntas Abiertas

Estas preguntas se deben resolver antes de implementar fases que dependan de ellas:

- Si Stripe falla o el usuario abandona el checkout, cual debe ser el estado visible de la inscripcion.
- Si la cancelacion publica debe ser siempre hasta cierre o configurable por torneo en una fase posterior.
- Si mas adelante se cobrara comision de plataforma con Stripe Connect u otro modelo.
