# Marimar Saving Circles - Monolith Application

Sistema de ahorro colaborativo "San Marimar" - Una plataforma completa para la gestión de círculos de ahorro donde los usuarios pueden unirse a grupos colaborativos.

## Arquitectura del Proyecto

Este proyecto está estructurado como un **monolito** con separación clara entre frontend y backend:

```
marimar-saving-circles/
├── client/                 # Frontend (React + TypeScript + Vite)
├── backend/                # Backend (Hono + Node.js + TypeScript)
├── shared/                 # Tipos y utilidades compartidas
└── package.json           # Configuración del monólito
```

## Tecnologías

### Frontend (Client)
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** + **shadcn/ui** para UI
- **React Router** para navegación
- **React Hook Form** + **Zod** para formularios
- **TanStack Query** para manejo de estado del servidor

### Backend (Server)
- **Hono** - Framework web rápido para Node.js
- **TypeScript** para type safety
- **PostgreSQL** (Neon.tech) + **Drizzle ORM** para base de datos
- **PASETO** para autenticación segura
- **Zod** para validación

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Cuenta en [Neon.tech](https://neon.tech) para PostgreSQL serverless

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd marimar-saving-circles

# Instalar dependencias del monólito
npm install

# O instalar manualmente en cada workspace
npm install --workspaces
```

### Configuración del Backend

```bash
# Copiar archivo de variables de entorno
cp backend/.env.example backend/.env

# Editar las variables según tu configuración
# IMPORTANTE: Configurar PASETO_SECRET con una clave segura de 32 bytes en base64
```

### Base de Datos - Neon.tech

1. **Crear cuenta en Neon.tech**
   - Ve a [neon.tech](https://neon.tech) y crea una cuenta gratuita
   - Crea un nuevo proyecto de PostgreSQL

2. **Obtener la URL de conexión**
   - En el dashboard de Neon, ve a "Connection Details"
   - Copia la "Connection string" que incluye usuario, contraseña y host

3. **Configurar variables de entorno**
   Edita `backend/.env` y configura:

```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```

4. **Inicializar Drizzle**
```bash
cd backend
npm run db:push    # Crear tablas en Neon
npm run db:generate # Generar tipos de TypeScript
```

### Verificar Instalación

```bash
# Verificar que todo funciona
npm run dev

# Si hay problemas con la DB, verificar con Drizzle Studio
cd backend
npm run db:studio  # Abre interfaz visual de base de datos
```

## Desarrollo

### Ejecutar ambos servicios (recomendado)

```bash
# Ejecuta frontend y backend simultáneamente
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

### Ejecutar servicios individualmente

```bash
# Solo frontend
npm run dev:client

# Solo backend
npm run dev:backend
```

### Build para producción

```bash
# Build completo
npm run build

# Build individual
npm run build:client
npm run build:backend
```

## Estructura de API

### Endpoints Disponibles

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

#### Grupos
- `GET /api/groups` - Listar grupos
- `POST /api/groups` - Crear grupo
- `GET /api/groups/:id` - Obtener grupo específico
- `PUT /api/groups/:id` - Actualizar grupo
- `DELETE /api/groups/:id` - Eliminar grupo

#### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `PUT /api/users/:id` - Actualizar usuario

#### Productos
- `GET /api/products` - Listar productos de ahorro
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto específico
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

## Estado Actual

### ✅ Completado
- Estructura monolítica configurada
- Frontend básico funcional
- Backend con Hono configurado
- Sistema de rutas placeholder
- Configuración de TypeScript
- Variables de entorno

### 🚧 En Desarrollo
- Implementación completa de API endpoints
- Modelos de base de datos
- Autenticación PASETO
- Lógica de negocio de círculos de ahorro
- Dashboard administrativo

### 📋 Pendiente
- Tests unitarios e integración
- Documentación de API completa
- Sistema de notificaciones
- Integración de pagos
- Despliegue en producción

## Contribución

1. Crear rama desde `main`
2. Realizar cambios
3. Ejecutar tests si existen
4. Hacer commit con mensaje descriptivo
5. Crear Pull Request

## Licencia

MIT
