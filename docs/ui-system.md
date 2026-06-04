# Sistema UI

## Objetivo

El sistema UI debe hacer que las pantallas nuevas se construyan con piezas
consistentes, sin repetir estilos largos ni inventar patrones por pantalla.

## Principios

- Usar componentes de `src/components/ui` antes de escribir clases desde cero.
- Usar `src/components/layout` para contenedores y encabezados de pagina.
- Mantener pantallas operativas y faciles de escanear.
- Evitar componentes enormes: si una vista crece, extraer secciones.
- No meter logica de negocio en componentes UI genericos.

## Tokens

Los tokens viven en `src/app/globals.css` y siguen el modelo de `shadcn/ui`:

- `background`
- `foreground`
- `card`
- `primary`
- `secondary`
- `muted`
- `accent`
- `destructive`
- `border`
- `input`
- `ring`

La paleta base es neutral con acento principal verde/teal y acentos secundarios
para estados. La UI no debe depender de una unica familia de color.

## Componentes Base

Disponibles:

- `Button`
- `Badge`
- `Card`
- `Input`
- `Textarea`
- `Select`
- `Label`
- `Alert`
- `Separator`
- `Skeleton`
- `Table`
- `EmptyState`

## Layouts

Disponibles:

- `PublicPage`
- `PublicPageHeader`
- `OrganizerPage`
- `OrganizerPageHeader`
- `OrganizerSection`

Uso esperado:

```tsx
import { OrganizerPage, OrganizerPageHeader } from "@/components/layout"

export default function Page() {
  return (
    <OrganizerPage>
      <OrganizerPageHeader
        title="Mis torneos"
        description="Gestiona tus torneos activos y revisa el estado de inscripciones."
      />
    </OrganizerPage>
  )
}
```

## Compatibilidad

No hay puente de compatibilidad visual global.

Las clases antiguas como `btn-primary`, `card`, `input`, `textarea`,
`container-custom` y `section-spacing` no deben existir en `globals.css`.

La auditoria de Fase 10 no deja usos de esas clases en `src/app`,
`src/modules` ni `src/components`. Si reaparecen, se consideran deuda nueva.

Codigo nuevo debe usar:

- componentes de `src/components/ui`,
- layouts de `src/components/layout`,
- clases Tailwind locales solo para composicion especifica de la pantalla.

## Siguiente Paso

Las nuevas features deben construirse directamente con componentes UI, layouts
de pagina y helpers semanticos. No se deben reintroducir clases globales de
compatibilidad.
