# Organiza Torneo

Aplicacion web para crear, publicar y gestionar torneos locales. El organizador
usa cuenta; los participantes se inscriben sin cuenta mediante solicitud publica
y verificacion por email.

## Estado Actual

El proyecto esta en fase de refactorizacion y limpieza arquitectonica. No se
deben anadir funcionalidades nuevas hasta cerrar el plan activo documentado en
`docs/roadmap.md`.

La base actual usa:

- Next.js App Router.
- React.
- TypeScript estricto.
- Supabase para auth, Postgres, RLS y storage.
- Tailwind CSS y componentes base en `src/components/ui`.
- Zod para contratos de entrada.
- Vitest para tests unitarios.
- Playwright para e2e.
- pnpm como package manager.

## Scripts

- ✨ **Gestión de Torneos**: Crea y administra torneos completos con soporte para múltiples formatos
- 👥 **Gestión de Participantes**: Registra jugadores y equipos con validación automática
- 📊 **Sistema de Clasificaciones**: Rankings y tablas de posiciones actualizadas en tiempo real
- 💳 **Pagos Integrados**: Procesa pagos de inscripción con Stripe
- 🔐 **Autenticación Segura**: Sistema de usuarios con Supabase
- 📱 **Diseño Responsive**: Interfaz optimizada para todos los dispositivos
- 🎯 **Validación de Datos**: Esquemas de validación robustos con Zod

## 🛠️ Tecnologías

### Frontend
- **Next.js 16**: Framework React con renderizado del lado del servidor
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Framework de estilos utility-first
- **UUID**: Generación de identificadores únicos

### Backend & Base de Datos
- **Supabase**: Backend as a Service (BaaS) con PostgreSQL
- **Supabase SSR**: Autenticación y gestión de sesiones
- **PostgreSQL/PLpgSQL**: Base de datos relacional (44.8% del código)

### Herramientas Adicionales
- **Stripe**: Procesamiento de pagos
- **ESLint**: Linting de código
- **Babel**: Compilación de JavaScript

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18 o superior
- npm, yarn, pnpm o bun

### Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/reguue2/Torneo-app.git
cd Torneo-app
```

2. **Instala las dependencias**
```bash
npm install
# o con yarn
yarn install
# o con pnpm
pnpm install
# o con bun
bun install
```

3. **Configura las variables de entorno**
Crea un archivo `.env.local` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
STRIPE_PUBLIC_KEY=tu_clave_publica_stripe
STRIPE_SECRET_KEY=tu_clave_secreta_stripe
```

4. **Inicia el servidor de desarrollo**
```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Notas:

- `pnpm test:e2e` arranca un servidor local con Playwright.
- En entornos sandbox puede necesitar permisos para abrir puerto local.
- `pnpm build` usa `next build --webpack`.

## Estructura

```txt
src/
  app/              Rutas Next y composicion ligera
  components/       UI generica y layouts compartidos
  lib/              Infraestructura transversal
  modules/          Modulos de producto por dominio
  shared/           Contratos y datos transversales
  types/            Tipos generados o compartidos
supabase/
  migrations/       Baseline limpia actual
docs/               Producto, arquitectura, base de datos y roadmap
e2e/                Tests Playwright
```

Regla principal:

- `app` compone.
- `ui` presenta.
- `server` adapta HTTP, Supabase y proveedores.
- `schemas` valida entradas.
- `domain` contiene reglas puras testeables.

## Documentacion

- `docs/product.md`: decisiones de producto y MVP.
- `docs/architecture.md`: limites de capas y dependencias permitidas.
- `docs/architecture-rules.md`: reglas automatizadas de arquitectura.
- `docs/ai-guidelines.md`: reglas para trabajar con IA sin romper el proyecto.
- `docs/database.md`: contrato de Supabase.
- `docs/database-types.md`: regeneracion de tipos Supabase.
- `docs/security.md`: Gitleaks, hooks y escaneo de secrets.
- `docs/storage.md`: bucket y policies de Storage.
- `docs/ui-system.md`: sistema UI.
- `docs/roadmap.md`: fases de refactorizacion y plan activo.

## Base De Datos

La baseline actual vive en:

```txt
supabase/migrations/20260528190000_initial_schema.sql
```

El proyecto no debe subir dumps ni migraciones legacy. La baseline anterior es
reemplazable porque no se conservan datos reales de produccion, siempre que el
schema y los contratos queden documentados.

## Regla De Trabajo Actual

Hasta cerrar la limpieza legacy:

- No anadir nuevas pantallas de producto.
- No activar Stripe real.
- No cambiar reglas de negocio salvo que sea para eliminar compatibilidad legacy
  documentada.
- No reintroducir clases globales legacy como `btn-primary`, `card`, `input` o
  `container-custom`.
- Todo cambio debe pasar `pnpm lint`, `pnpm typecheck`, `pnpm test` y, cuando
  toque flujos UI, `pnpm test:e2e`.
