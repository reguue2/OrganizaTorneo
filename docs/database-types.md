# Tipos De Base De Datos

## Fuente De Verdad

La fuente de verdad del schema actual es:

```txt
supabase/migrations/20260528190000_initial_schema.sql
```

Los tipos TypeScript viven en:

```txt
src/types/database.ts
```

## Estado Actual

`src/types/database.ts` se ha revisado contra la baseline actual. Se retiro la
RPC legacy `create_public_registration`, que ya no existe en SQL.

No se han regenerado automaticamente en esta pasada porque `supabase gen types
--local` necesita una instancia local de Supabase arrancada y accesible.

## Regeneracion

1. Arranca Supabase local:

```bash
supabase start
```

2. Aplica o resetea la base local desde la baseline:

```bash
supabase db reset
```

3. Regenera los tipos:

```bash
pnpm db:types
```

4. Verifica:

```bash
pnpm typecheck
pnpm test
```

## Reglas

- No editar `src/types/database.ts` a mano salvo correcciones puntuales
  documentadas.
- Si cambia `supabase/migrations/20260528190000_initial_schema.sql`, regenerar
  tipos en la misma rama.
- No reintroducir RPCs legacy en los tipos si no existen en SQL.
