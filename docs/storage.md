# Storage

## Bucket Actual

El proyecto usa un unico bucket de Storage para carteles de torneo:

```txt
tournament-posters
```

Uso actual:

- Subida desde `src/modules/tournaments/server/create-tournament-action.ts`.
- Lectura publica mediante URLs de Supabase Storage.
- Renderizado con `next/image` usando el dominio de
  `NEXT_PUBLIC_SUPABASE_URL`.

## Setup En SQL

La baseline crea el bucket y sus policies en:

```txt
supabase/migrations/20260528190000_initial_schema.sql
```

Configuracion:

- Bucket publico: si.
- Tamano maximo: 5MB.
- MIME types permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- Ruta de objeto: `{auth.uid()}/{uuid}.{ext}`.

Policies:

- `anon` y `authenticated` pueden leer objetos del bucket.
- `authenticated` puede subir objetos solo dentro de su carpeta de usuario.
- `authenticated` puede actualizar y borrar solo objetos dentro de su carpeta
  de usuario.

## Reglas De Codigo

- No usar otro bucket para carteles.
- No subir carteles en la raiz del bucket; siempre bajo carpeta de usuario.
- Si se cambia el limite de tamano o MIME types en codigo, cambiar tambien la
  baseline SQL.
- No guardar secrets de Storage en variables publicas.
