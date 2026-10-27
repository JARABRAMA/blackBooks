# Biblitec System

Sistema de gestión bibliotecaria construido con [Next.js 15](https://nextjs.org), [TypeScript](https://www.typescriptlang.org), [Prisma](https://www.prisma.io) y [PostgreSQL](https://www.postgresql.org). Permite gestionar usuarios, libros, copias, reservas, préstamos y transacciones con autenticación basada en JWT.

## Características

- **Autenticación**: Registro, inicio/cierre de sesión con JWT almacenado en cookie HTTP-only
- **Gestión de libros**: Catálogo con múltiples copias por libro
- **Reservas**: Los usuarios pueden reservar copias disponibles (expiran en 24 horas)
- **Préstamos**: Los administradores gestionan préstamos (plazo 14 días)
- **Devoluciones**: Registro de devoluciones con detección de retraso
- **Panel administrativo**: Gestión de usuarios, préstamos, reservas y transacciones
- **Control de inventario**: Estados de copias (AVAILABLE, RESERVED, LOANED, DAMAGED, LOST, MAINTENANCE)

## Tecnologías

- [Next.js 15](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Prisma ORM](https://www.prisma.io) + [@prisma/adapter-pg](https://www.prisma.io/docs/orm/overview/databases/postgresql#prisma-postgres)
- [PostgreSQL](https://www.postgresql.org)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Hash de contraseñas
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Autenticación JWT
- [Tailwind CSS 4](https://tailwindcss.com)

## Requisitos previos

- Node.js 18+ 
- pnpm (recomendado)
- Base de datos PostgreSQL

## Configuración

1. Clonar el repositorio
```bash
git clone <repo-url>
cd biblitec-system
```

2. Instalar dependencias
```bash
pnpm install
```

3. Configurar variables de entorno. Copiar `.env.example` a `.env`:
```bash
cp .env.example .env
```

Variables necesarias:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/biblitec"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

4. Ejecutar migraciones de Prisma
```bash
pnpm prisma migrate dev
```

5. Generar cliente de Prisma
```bash
pnpm prisma generate
```

6. Iniciar servidor de desarrollo
```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
biblitec-system/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (ver documentación abajo)
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── prisma.ts          # Cliente Prisma singleton
├── modules/               # Módulos de negocio
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
└── components/            # Componentes React
```

## API Routes

Todos los endpoints están bajo `/api`. La autenticación se realiza mediante cookie `token` (HTTP-only) con JWT.

### Autenticación (`/api/auth`)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | - | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | No | - | Iniciar sesión (establece cookie `token`) |
| `GET` | `/api/auth/me` | Sí | USER/ADMIN | Obtener información del usuario autenticado |
| `POST` | `/api/auth/logout` | Sí | USER/ADMIN | Cerrar sesión (limpia cookie `token`) |

#### `POST /api/auth/register`

**Body:**
```json
{
  "name": "Juan",
  "surnames": "Pérez García",
  "dni": "12345678A",
  "email": "juan@example.com",
  "phoneNumber": "+34600123456",
  "birthDay": "1990-01-01",
  "password": "password123",
  "role": "USER" // Opcional, solo "USER" o "ADMIN". Por defecto "USER"
}
```

**Respuesta (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "clx...",
    "name": "Juan",
    "surnames": "Pérez García",
    "email": "juan@example.com",
    "role": "USER"
  }
}
```

**Errores:** `400` (campos faltantes o email/DNI duplicados), `500`

#### `POST /api/auth/login`

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "clx...",
    "name": "Juan",
    "surnames": "Pérez García",
    "email": "juan@example.com",
    "role": "USER",
    "image": null
  }
}
```
*Establece cookie `token` con JWT válido por 7 días.*

**Errores:** `400` (campos faltantes), `401` (credenciales inválidas), `500`

#### `GET /api/auth/me`

**Headers/Cookies:** Requiere cookie `token`

**Respuesta (200):**
```json
{
  "user": {
    "id": "clx...",
    "name": "Juan",
    "surnames": "Pérez García",
    "email": "juan@example.com",
    "role": "USER",
    "image": null,
    "dni": "12345678A",
    "phoneNumber": "+34600123456"
  }
}
```

**Errores:** `401` (no autorizado o token inválido), `404` (usuario no encontrado)

#### `POST /api/auth/logout`

**Headers/Cookies:** Requiere cookie `token`

**Respuesta (200):**
```json
{
  "message": "Sesión cerrada"
}
```
*Limpia la cookie `token`.*

### Libros (`/api/books`)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/books` | No | - | Listar todos los libros con sus copias |
| `POST` | `/api/books` | No* | - | Crear libro con copias (se genera código automático) |

\*Nota: En el código actual no hay verificación de rol, pero debería ser restringido a ADMIN en producción.

#### `GET /api/books`

**Respuesta (200):**
```json
{
  "books": [
    {
      "id": "clx...",
      "title": "Cien años de soledad",
      "author": "Gabriel García Márquez",
      "category": "Novela",
      "isbn": "978-3-16-148410-0",
      "description": "...",
      "coverImage": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "copies": [
        {
          "id": "clx...",
          "bookId": "clx...",
          "code": "CIE-1234567890-1",
          "status": "AVAILABLE",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### `POST /api/books`

**Body:**
```json
{
  "title": "Cien años de soledad",
  "author": "Gabriel García Márquez",
  "category": "Novela",
  "isbn": "978-3-16-148410-0", // Opcional
  "description": "Descripción del libro", // Opcional
  "coverImage": "https://...", // Opcional
  "copies": 3 // Cantidad de copias a crear
}
```

**Respuesta (201):**
```json
{
  "message": "Libro agregado exitosamente",
  "book": {
    "id": "clx...",
    "title": "...",
    "copies": [...]
  }
}
```

*Los códigos de copia se generan como: `{ISBN_PREFIX or TITLE_PREFIX}-{timestamp}-{index}`*

**Errores:** `400` (campos requeridos faltantes), `500`

### Préstamos (`/api/loans`)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/loans` | Sí | USER/ADMIN | Listar préstamos del usuario autenticado |
| `POST` | `/api/loans` | Sí | ADMIN | Crear préstamo (desde reserva o directo) |
| `POST` | `/api/loans/[id]/return` | Sí | ADMIN | Registrar devolución de un préstamo |

#### `GET /api/loans`

**Headers/Cookies:** Requiere cookie `token`

**Respuesta (200):**
```json
{
  "loans": [
    {
      "id": "clx...",
      "userId": "clx...",
      "copyId": "clx...",
      "reservationId": "clx..." | null,
      "loanDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "returnDate": null,
      "status": "ACTIVE", // ACTIVE | RETURNED | OVERDUE
      "copy": {
        "id": "clx...",
        "code": "CIE-1234567890-1",
        "book": {
          "id": "clx...",
          "title": "Cien años de soledad",
          "author": "Gabriel García Márquez"
        }
      }
    }
  ]
}
```

**Errores:** `401` (no autorizado), `500`

#### `POST /api/loans`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Body:**
```json
{
  "userId": "clx...",      // Requerido
  "copyId": "clx...",      // Requerido
  "reservationId": "clx..." // Opcional - si viene de una reserva
}
```

**Acciones:**
1. Crea préstamo con `status: ACTIVE`, `dueDate` = fecha actual + 14 días
2. Actualiza copia a `status: LOANED`
3. Si hay `reservationId`, marca reserva como `FULFILLED` con `fulfilledAt`
4. Crea transacción tipo `LOAN`

**Respuesta (201):**
```json
{
  "message": "Préstamo registrado exitosamente",
  "loan": {
    "id": "clx...",
    "userId": "clx...",
    "copyId": "clx...",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "status": "ACTIVE"
  }
}
```

**Errores:** `400` (campos faltantes), `401` (no autorizado), `403` (no es admin), `500`

#### `POST /api/loans/[id]/return`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Path params:** `id` - ID del préstamo

**Acciones:**
1. Verifica que el préstamo exista y no esté devuelto
2. Si `now > dueDate`, marca préstamo como `OVERDUE`, sino `RETURNED`
3. Actualiza copia a `status: AVAILABLE`
4. Crea transacción tipo `RETURN` con nota según si fue a tiempo o con retraso

**Respuesta (200):**
```json
{
  "message": "Devolución registrada exitosamente"
}
```

**Errores:** `400` (préstamo ya devuelto), `401` (no autorizado), `403` (no es admin), `404` (préstamo no encontrado), `500`

### Reservas (`/api/reservations`)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/reservations` | Sí | USER/ADMIN | Listar reservas del usuario autenticado |
| `POST` | `/api/reservations` | Sí | USER/ADMIN | Reservar una copia disponible de un libro |

#### `GET /api/reservations`

**Headers/Cookies:** Requiere cookie `token`

**Respuesta (200):**
```json
{
  "reservations": [
    {
      "id": "clx...",
      "userId": "clx...",
      "copyId": "clx...",
      "status": "PENDING", // PENDING | FULFILLED | CANCELLED | EXPIRED
      "reservedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-02T00:00:00.000Z",
      "fulfilledAt": null,
      "cancelledAt": null,
      "copy": {
        "id": "clx...",
        "code": "CIE-1234567890-1",
        "book": {
          "id": "clx...",
          "title": "Cien años de soledad",
          "author": "Gabriel García Márquez"
        }
      }
    }
  ]
}
```

**Errores:** `401` (no autorizado), `500`

#### `POST /api/reservations`

**Headers/Cookies:** Requiere cookie `token`

**Body:**
```json
{
  "bookId": "clx..." // Requerido
}
```

**Acciones:**
1. Busca una copia disponible (`status: AVAILABLE`) del libro
2. Crea reserva con `status: PENDING`, `expiresAt` = fecha actual + 24 horas
3. Actualiza copia a `status: RESERVED`

**Respuesta (201):**
```json
{
  "message": "Reserva realizada exitosamente",
  "reservation": {
    "id": "clx...",
    "userId": "clx...",
    "copyId": "clx...",
    "status": "PENDING",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**Errores:** `400` (bookId faltante o no hay copias disponibles), `401` (no autorizado), `500`

### Administración (`/api/admin`)

Todos los endpoints de administración requieren autenticación con rol `ADMIN`.

#### Usuarios

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/admin/users` | Sí | ADMIN | Listar todos los usuarios |
| `PUT` | `/api/admin/users/[id]` | Sí | ADMIN | Actualizar rol de un usuario |

##### `GET /api/admin/users`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Respuesta (200):**
```json
{
  "users": [
    {
      "id": "clx...",
      "name": "Juan",
      "surnames": "Pérez García",
      "email": "juan@example.com",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "dni": "12345678A"
    }
  ]
}
```

**Errores:** `401` (no autorizado), `403` (no es admin), `500`

##### `PUT /api/admin/users/[id]`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Path params:** `id` - ID del usuario

**Body:**
```json
{
  "role": "ADMIN" // Requerido: "USER" o "ADMIN"
}
```

**Respuesta (200):**
```json
{
  "message": "Usuario actualizado exitosamente",
  "user": {
    "id": "clx...",
    "name": "Juan",
    "surnames": "Pérez García",
    "email": "juan@example.com",
    "role": "ADMIN"
  }
}
```

**Errores:** `400` (rol inválido), `401` (no autorizado), `403` (no es admin), `500`

#### Préstamos (Admin)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/admin/loans` | Sí | ADMIN | Listar todos los préstamos con usuario y libro |

##### `GET /api/admin/loans`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Respuesta (200):**
```json
{
  "loans": [
    {
      "id": "clx...",
      "userId": "clx...",
      "copyId": "clx...",
      "loanDate": "2024-01-01T00:00:00.000Z",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "returnDate": null,
      "status": "ACTIVE",
      "user": {
        "id": "clx...",
        "name": "Juan",
        "surnames": "Pérez García",
        "email": "juan@example.com"
      },
      "copy": {
        "id": "clx...",
        "code": "CIE-1234567890-1",
        "book": {
          "id": "clx...",
          "title": "Cien años de soledad",
          "author": "Gabriel García Márquez"
        }
      }
    }
  ]
}
```

**Errores:** `401` (no autorizado), `403` (no es admin), `500`

#### Reservas (Admin)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/admin/reservations` | Sí | ADMIN | Listar todas las reservas con usuario y libro |

##### `GET /api/admin/reservations`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Respuesta (200):**
```json
{
  "reservations": [
    {
      "id": "clx...",
      "userId": "clx...",
      "copyId": "clx...",
      "status": "PENDING",
      "reservedAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-02T00:00:00.000Z",
      "user": {
        "id": "clx...",
        "name": "Juan",
        "surnames": "Pérez García",
        "email": "juan@example.com"
      },
      "copy": {
        "id": "clx...",
        "code": "CIE-1234567890-1",
        "book": {
          "id": "clx...",
          "title": "Cien años de soledad",
          "author": "Gabriel García Márquez"
        }
      }
    }
  ]
}
```

**Errores:** `401` (no autorizado), `403` (no es admin), `500`

#### Transacciones (Admin)

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| `GET` | `/api/admin/transactions` | Sí | ADMIN | Listar todas las transacciones con detalles |

##### `GET /api/admin/transactions`

**Headers/Cookies:** Requiere cookie `token` con rol `ADMIN`

**Respuesta (200):**
```json
{
  "transactions": [
    {
      "id": "clx...",
      "type": "LOAN", // RESERVATION | LOAN | RETURN
      "loanId": "clx...",
      "actorId": "clx...",
      "notes": "Préstamo registrado",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "actor": {
        "id": "clx...",
        "name": "Admin",
        "surnames": "Apellido",
        "email": "admin@example.com"
      },
      "loan": {
        "id": "clx...",
        "user": {
          "name": "Juan",
          "surnames": "Pérez García"
        },
        "copy": {
          "code": "CIE-1234567890-1",
          "book": {
            "title": "Cien años de soledad",
            "author": "Gabriel García Márquez"
          }
        }
      }
    }
  ]
}
```

**Errores:** `401` (no autorizado), `403` (no es admin), `500`

## Modelo de datos

### Enums

- **UserRole**: `USER` | `ADMIN`
- **BookCopyStatus**: `AVAILABLE` | `RESERVED` | `LOANED` | `DAMAGED` | `LOST` | `MAINTENANCE`
- **ReservationStatus**: `PENDING` | `FULFILLED` | `CANCELLED` | `EXPIRED`
- **LoanStatus**: `ACTIVE` | `RETURNED` | `OVERDUE`
- **TransactionType**: `RESERVATION` | `LOAN` | `RETURN`

### Entidades principales

- **User**: Usuarios del sistema (con roles)
- **Book**: Catálogo de libros
- **BookCopy**: Ejemplares físicos de cada libro (con código único)
- **Reservation**: Reservas de copias (expiran en 24h)
- **Loan**: Préstamos activos/históricos (plazo 14 días)
- **Transaction**: Registro de auditoría de operaciones

Ver [prisma/schema.prisma](./prisma/schema.prisma) para el esquema completo.

## Autenticación y autorización

- **JWT**: Token firmado con `JWT_SECRET`, expira en 7 días
- **Almacenamiento**: Cookie `token` con flags `httpOnly`, `secure` (solo producción), `sameSite: 'lax'`
- **Verificación**: Se verifica en cada endpoint protegido mediante `jwt.verify()` con el secret
- **Roles**: 
  - `USER`: Puede reservar libros, ver sus propios préstamos/reservas
  - `ADMIN`: Puede crear préstamos, registrar devoluciones, gestionar usuarios y ver toda la información

## Scripts disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Servidor de producción
pnpm lint         # Linter
pnpm prisma studio # Interfaz visual de Prisma
pnpm prisma migrate dev # Crear y aplicar migraciones
pnpm prisma generate   # Generar cliente Prisma
```

## Notas de seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Los tokens JWT se almacenan en cookies HTTP-only (no accesibles desde JavaScript)
- Las rutas administrativas verifican rol `ADMIN`
- Los usuarios solo pueden ver sus propios préstamos y reservas
- El campo `password` nunca se expone en las respuestas

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia

Este proyecto es privado.
