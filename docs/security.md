# Seguridad

## Secret Scanning

El proyecto usa Gitleaks para detectar secrets antes de subir cambios.

Scripts:

```bash
pnpm security:secrets
pnpm security:secrets:staged
```

Configuracion:

```txt
.gitleaks.toml
```

## Local

Gitleaks debe estar instalado como binario local en `PATH`.

Opciones habituales:

```bash
brew install gitleaks
```

o descargar el binario desde releases oficiales de Gitleaks.

No se usa el paquete npm `gitleaks` porque no expone el binario de la herramienta
real.

## CI

El workflow instala Gitleaks 8.30.1 desde release oficial, verifica la checksum
del tarball Linux x64 y ejecuta:

```bash
pnpm security:secrets
```

No se configuran secrets reales en CI.

## Lefthook

`lefthook.yml` ejecuta `pnpm security:secrets:staged` en `pre-commit`.

Para instalar hooks localmente:

```bash
pnpm lefthook:install
```
