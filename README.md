# 🏆 Torneo-app

Plataforma moderna para organizar y gestionar torneos deportivos. Crea, administra y monetiza tus eventos deportivos con una interfaz intuitiva y herramientas profesionales.

## 📋 Características

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
npm run dev
# o con yarn
yarn dev
# o con pnpm
pnpm dev
# o con bun
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📖 Estructura del Proyecto

```
Torneo-app/
├── app/                 # Directorio de la aplicación Next.js
├── components/          # Componentes React reutilizables
├── lib/                 # Utilidades y funciones auxiliares
├── public/              # Archivos estáticos
├── styles/              # Estilos globales
├── package.json         # Dependencias del proyecto
└── tsconfig.json        # Configuración de TypeScript
```

## 🔧 Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter de código

## 🌐 Despliegue

### Desplegar en Vercel

La forma más sencilla de desplegar es usando [Vercel Platform](https://vercel.com):

1. Conecta tu repositorio de GitHub a Vercel
2. Las variables de entorno se configurarán automáticamente
3. Vercel compilará y desplegará automáticamente en cada push

Para más detalles, consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## 📚 Aprender Más

- [Documentación de Next.js](https://nextjs.org/docs) - Características y API de Next.js
- [Tutorial Next.js](https://nextjs.org/learn) - Tutorial interactivo
- [Documentación de Supabase](https://supabase.com/docs) - Base de datos y autenticación
- [Documentación de Stripe](https://stripe.com/docs) - Integración de pagos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo una licencia abierta. Consulta el archivo LICENSE para más detalles.

## 📞 Contacto

Para preguntas o sugerencias, puedes abrir un issue en el repositorio o contactar al autor.

---

**Creado con ❤️ por [reguue2](https://github.com/reguue2)**
