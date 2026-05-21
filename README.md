# AWITAV

Frontend web para monitorear niveles de agua en tinacos. Forma parte del monorepo **awitafull** junto con el API NestJS (`awita-back`) y el firmware de dispositivos (`awita-arduino`).

## Stack

- [Vue 3](https://vuejs.org/) + [Vite](https://vite.dev/)
- [Pinia](https://pinia.vuejs.org/) para estado
- [Vue Router](https://router.vuejs.org/)
- [Clerk](https://clerk.com/) para autenticación
- [Lucide](https://lucide.dev/) (`@lucide/vue`) para iconos
- API REST de **awita-back** (NestJS + MySQL vía Prisma)

## Funcionalidades

| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública con inicio de sesión y registro (modales Clerk) |
| `/dashboard` | Resumen de sensores y acceso rápido al detalle |
| `/sensores` | Listado, registro, desvinculación y configuración de alertas |
| `/sensor/:id` | Detalle del sensor, gráfica de historial y enlace a alertas |
| `/notificaciones` | Bandeja de alertas (nivel bajo, desconexión) |

Desde la app puedes:

- Vincular sensores existentes por ID (creados por el dispositivo físico).
- Ver nivel actual, estado en línea/desconectado e historial (24 h, 7 d, 30 d).
- Configurar alertas: desconexión, umbral de nivel bajo, método (email/SMS) y cooldown entre notificaciones.

## Requisitos

- Node.js 20+
- npm
- Instancia de [Clerk](https://dashboard.clerk.com/) (clave publicable)
- **awita-back** en ejecución local o desplegado (salvo que uses modo mock)

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` en la raíz de `awitav/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_USE_MOCK=false
```

| Variable | Descripción |
|----------|-------------|
| `VITE_API_BASE_URL` | URL base del API (sin barra final). Ej.: `http://localhost:3000` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clave publicable de Clerk |
| `VITE_USE_MOCK` | `true` = datos locales de prueba; `false` = API real |

3. En Clerk, configurar URLs de redirección tras login/registro hacia `/dashboard` (ya definidas en `src/main.ts`).

4. Para usuarios reales en base de datos, el backend debe recibir el webhook de Clerk (`POST /webhook/clerk`). Ver documentación en `awita-back`.

## Desarrollo

Con el API y la base de datos levantados en `awita-back`:

```bash
# Terminal 1 — backend
cd ../awita-back
npm run start:local

# Terminal 2 — frontend
npm run dev
```

La app queda en `http://localhost:5173` (puerto por defecto de Vite).

### Modo mock

Si no tienes backend ni base de datos:

```env
VITE_USE_MOCK=true
```

No hace falta `VITE_API_BASE_URL` en ese caso. Los datos provienen de `src/services/sensorService.mock.ts`.

## Scripts

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción (`vue-tsc` + Vite) |
| `npm run preview` | Vista previa del build |

## Integración con el API

El cliente HTTP (`src/services/apiClient.ts`) envía el JWT de Clerk en `Authorization: Bearer …` en cada petición autenticada.

Principales recursos usados:

- `GET /sensors` — sensores del usuario
- `POST /sensors` — registrar sensor (`{ "sensor_id": "..." }`)
- `GET /sensors/:id/readings?timeRange=24h|7d|30d` — historial
- `PATCH /sensors/:id/water-level-alert`, `.../disconnection-alert`, `.../water-level-threshold`, `.../alert-preferences`
- `GET /notifications` — notificaciones

Las lecturas en tiempo real las envía el firmware a endpoints públicos del backend (`POST /sensors/:id/readings`); el usuario solo **vincula** ese ID desde la web.

## Estructura del proyecto

```
src/
├── assets/          # Estilos globales
├── components/      # Layout, sidebar, gauge, iconos
├── config/env.ts    # Variables de entorno
├── router/          # Rutas y guard de autenticación
├── services/        # API, mappers, mock y fachada sensorService
├── stores/          # auth (Clerk), sensors (dashboard y detalle)
├── utils/format.ts  # Formato de fechas, litros, alertas
└── views/           # Landing, dashboard, sensores, detalle, notificaciones
```

## Monorepo

| Carpeta | Rol |
|---------|-----|
| `awitav/` | Este frontend |
| `awita-back/` | API NestJS, Prisma, MySQL |
| `awita-arduino/` | Firmware ESP8266/ESP32 |

## Notas

- El backend usa **MySQL**, no PostgreSQL.
- Tras registrar un sensor en la app, el ID debe coincidir con el que devolvió el dispositivo al provisionarse (`POST /sensors/device` en el backend).
- Swagger del API (local): `http://localhost:3000/api`
