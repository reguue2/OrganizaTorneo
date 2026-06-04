# Reglas De Arquitectura

## Objetivo

El proyecto usa `dependency-cruiser` para impedir dependencias que rompan la
separacion entre dominio, UI e infraestructura.

Script:

```bash
pnpm arch:check
```

Configuracion:

```txt
dependency-cruiser.config.cjs
```

## Reglas Activas

- No imports circulares.
- `src/modules/*/domain` no puede importar `src/modules/*/ui`.
- `src/modules/*/domain` no puede importar `src/components`.
- `src/modules/*/domain` no puede importar React.
- `src/modules/*/domain` no puede importar Next.
- `src/modules/*/domain` no puede importar Supabase directamente.
- `src/modules/*/domain` no puede importar `src/types/database`.

## Como Corregir Violaciones

- Si `domain` necesita datos, pasar modelos simples desde `server` o `ui`.
- Si `domain` necesita formateo visual, moverlo a `ui`.
- Si `domain` necesita una regla compartida, crear una funcion pura dentro del
  propio modulo de dominio.
- Si aparece un ciclo, extraer tipos o helpers puros a un archivo de menor nivel.

## Regla Para IA

Antes de anadir features o mover archivos, ejecutar:

```bash
pnpm arch:check
```

No silenciar una violacion sin explicar por que la regla ya no aplica.
