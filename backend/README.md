# Backend - Marimar Saving Circles

Backend API para el sistema de ahorro colaborativo "San Marimar" construido con Hono, TypeScript y Drizzle ORM.

## Tecnologías

- **Hono** - Framework web ultrarrápido para Node.js
- **TypeScript** - Type safety
- **Drizzle** - ORM ligero y type-safe para TypeScript
- **PostgreSQL** (Neon.tech) - Base de datos serverless
- **PASETO** - Autenticación segura (alternativa a JWT)
- **Zod** - Validación de esquemas

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Base de datos - Obtén esta URL de Neon.tech
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# PASETO Secret - Clave base64 de 32 bytes (genera una segura)
PASETO_SECRET=tu-clave-paseto-base64-de-32-bytes

# Puerto del servidor
PORT=5000

# URL del frontend para CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Neon.tech

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta gratuita
2. Crea un nuevo proyecto PostgreSQL
3. Ve a "Connection Details" y copia la connection string
4. Pégala en `DATABASE_URL` en tu `.env`

### 4. Configurar ImgBB para Subida de Imágenes

El sistema usa ImgBB para almacenar las imágenes de cédula de identidad de los usuarios.

1. Ve a [imgbb.com](https://imgbb.com) y crea una cuenta gratuita
2. Ve a [API](https://api.imgbb.com) y genera una API key
3. Agrega tu API key en el archivo `.env`:

```env
IMGBB_API_KEY=tu-api-key-de-imgbb-aqui
```

**Nota**: ImgBB ofrece 500 subidas gratuitas por mes. Para más uso, considera actualizar a un plan pago.

### 4. Inicializar Drizzle

```bash
# Crear tablas en la base de datos
npm run db:push

# Generar tipos de TypeScript
npm run db:generate

# (Opcional) Abrir Drizzle Studio para ver la base de datos
npm run db:studio
```

## Desarrollo

### Ejecutar en Modo Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Health Check

```bash
curl http://localhost:5000/api/health
```

## Estructura del Proyecto

```
backend/
├── drizzle.config.ts           # Configuración de Drizzle
├── src/
│   ├── db/
│   │   └── schema.ts           # Esquema de base de datos
│   ├── config/
│   │   └── database.ts         # Configuración de Drizzle
│   ├── middleware/
│   │   ├── errorHandler.ts     # Manejo de errores
│   │   └── rateLimiter.ts      # Rate limiting
│   ├── routes/
│   │   ├── auth.ts            # Rutas de autenticación
│   │   ├── groups.ts          # Rutas de grupos
│   │   ├── users.ts           # Rutas de usuarios
│   │   └── products.ts        # Rutas de productos
│   └── server.ts              # Servidor principal
├── .env.example               # Variables de entorno (ejemplo)
├── package.json
├── tsconfig.json
└── README.md
```

## Modelos de Base de Datos

### User (Usuario)

- Información personal completa
- Autenticación con contraseña hasheada
- Rol: USUARIO o ADMINISTRADOR

### Group (Grupo)

- Grupos de ahorro colaborativo
- Estados: SIN_COMPLETAR, LLENO, EN_MARCHA, COMPLETADO
- Gestión de turnos y sorteos

### Product (Producto)

- Planes de ahorro disponibles
- Valores mensuales y quincenales
- Duración del plan

### LotteryResult (Resultado de Sorteo)

- Registro de sorteos realizados
- Ganadores por posición

### PaymentOption (Opción de Pago)

- Configuración de métodos de pago
- Soporte para móvil y Binance

## API Endpoints

### Autenticación

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

### Grupos

```
GET    /api/groups
POST   /api/groups
GET    /api/groups/:id
PUT    /api/groups/:id
DELETE /api/groups/:id
```

### Usuarios

```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id/profile
PUT    /api/users/:id/status
DELETE /api/users/:id
POST   /api/users/join
GET    /api/users/me/groups
GET    /api/users/me/contributions
GET    /api/users/me/deliveries
```

### Productos

```
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload

# Base de datos
npm run db:generate  # Generar tipos de TypeScript
npm run db:push      # Crear/actualizar tablas
npm run db:migrate   # Ejecutar migraciones
npm run db:studio    # Abrir Drizzle Studio

# Build
npm run build        # Compilar TypeScript

# Producción
npm run start        # Ejecutar servidor compilado

# Testing
npm run test         # Ejecutar tests

# Linting
npm run lint         # Verificar código
```

## Migraciones de Base de Datos

Cuando cambies el esquema en `src/db/schema.ts`:

```bash
# Para desarrollo (reinicia datos)
npm run db:push

# Para producción (mantiene datos)
npm run db:migrate
```

## Despliegue

### Variables de Entorno para Producción

Asegúrate de configurar estas variables en tu plataforma de despliegue:

```env
NODE_ENV=production
DATABASE_URL=tu-connection-string-de-neon
PASETO_SECRET=tu-clave-paseto-base64-produccion
FRONTEND_URL=https://tu-dominio.com
```

### Build para Producción

```bash
npm run build
npm run start
```

## Solución de Problemas

### Error de Conexión a Base de Datos

1. Verifica que `DATABASE_URL` esté correcta
2. Asegúrate de que Neon.tech permita conexiones desde tu IP
3. Verifica que `sslmode=require` esté incluido

### Error de Drizzle

Si hay problemas con Drizzle:

```bash
# Regenerar tipos
npm run db:generate

# Reiniciar TypeScript
npm run dev
```

### Problemas de CORS

Si hay errores de CORS en desarrollo:

- Verifica `FRONTEND_URL` en `.env`
- Asegúrate de que incluya el protocolo (http/https)

## Contribución

1. Crea una rama desde `main`
2. Realiza cambios siguiendo la estructura existente
3. Asegúrate de que `npm run lint` pase
4. Actualiza documentación si es necesario
5. Crea un Pull Request

## Soporte

Para soporte técnico o preguntas:

- Revisa los issues del repositorio
- Consulta la documentación de [Hono](https://hono.dev) y [Drizzle](https://orm.drizzle.team)
