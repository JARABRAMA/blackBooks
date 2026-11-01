# BlackBooks — Sistema de Gestión de Biblioteca

Aplicación web fullstack para administrar el catálogo bibliotecario, ejemplares, reservas, préstamos, devoluciones, usuarios y transacciones. Está construida con Next.js App Router, React, TypeScript, Tailwind CSS, Prisma y PostgreSQL (compatible con Supabase).

## Funcionalidades

- Registro e inicio/cierre de sesión con JWT en cookie `HttpOnly`.
- Roles `ADMIN` y `USER`; el registro público siempre crea usuarios `USER`.
- Catálogo con búsqueda y disponibilidad de ejemplares.
- Reservas de libros para usuarios autenticados.
- Inventario y creación de libros/ejemplares para administradores.
- Préstamos y devoluciones registrados en operaciones atómicas.
- Historial de reservas, préstamos y devoluciones.
- Reportes con indicadores y gráfica de actividad de los últimos siete días.
- Administración de usuarios y roles para administradores.

## Tecnologías

- Next.js 16 y React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM y PostgreSQL
- Supabase como proveedor de PostgreSQL
- bcryptjs para hash de contraseñas
- jsonwebtoken para sesiones

## Requisitos

- Node.js 20.9 o superior (recomendado para Next.js 16)
- pnpm 12 (el proyecto declara `pnpm@12.15.0`)
- Proyecto PostgreSQL en Supabase

## Instalación local

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd blackBooks
   ```

2. Instala dependencias:

   ```bash
   pnpm install
   ```

3. Copia `.env.example` a `.env` y configura los valores reales:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: cadena PostgreSQL de Supabase.
   - `JWT_SECRET`: secreto aleatorio largo y privado. No lo subas a GitHub.

4. Aplica todas las migraciones pendientes (en una base vacía se ejecutarán en orden; en una base existente se aplicarán solo las pendientes):

   ```bash
   pnpm exec prisma migrate dev
   ```

5. Genera el cliente de Prisma:

   ```bash
   pnpm exec prisma generate
   ```

6. Inicia el servidor:

   ```bash
   pnpm dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno para Vercel

Configura `DATABASE_URL` y `JWT_SECRET` en **Project → Settings → Environment Variables** de Vercel. No agregues el archivo `.env` al repositorio. Ejecuta las migraciones contra la base de datos de destino antes de probar la aplicación desplegada.

## Roles

| Funcionalidad | USER | ADMIN |
|---|:---:|:---:|
| Consultar catálogo | Sí | Sí |
| Reservar libros | Sí | Sí |
| Consultar sus préstamos | Sí | Sí |
| Consultar transacciones | Sí | Sí |
| Crear libros y ejemplares | No | Sí |
| Gestionar préstamos y devoluciones | No | Sí |
| Gestionar usuarios y roles | No | Sí |

La interfaz oculta opciones según el rol, pero las API también verifican la sesión y los permisos en el servidor. El rol se consulta en la base de datos para evitar confiar en un rol antiguo guardado en el JWT.

## Cuentas de prueba

Crea las cuentas desde el formulario de registro. El registro público asigna siempre el rol `USER`. Para habilitar una cuenta de administración en un entorno local/de pruebas, actualiza el rol directamente en Supabase SQL Editor después de registrar la cuenta:

```sql
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "email" = 'CORREO_ADMIN_DE_PRUEBA';
```

Registra las credenciales reales de prueba aquí antes de entregar el proyecto:

- **USER:** correo: `<CORREO_USER>` · contraseña: `<DEFINIR_PARA_LA_DEMO>`
- **ADMIN:** correo: `<CORREO_ADMIN>` · contraseña: `<DEFINIR_PARA_LA_DEMO>`

No uses contraseñas personales ni incluyas secretos de producción en este documento.

## Integrantes

- `<NOMBRE_INTEGRANTE_1>`
- `<NOMBRE_INTEGRANTE_2>`
- `<NOMBRE_INTEGRANTE_3>`

## Despliegue

- **Vercel:** `<URL_DE_LA_APLICACION>`
- **Repositorio:** `<URL_DEL_REPOSITORIO>`

## Comandos útiles

```bash
pnpm dev       # Desarrollo
pnpm lint      # Revisión ESLint
pnpm build     # Compilación de producción
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

## Notas de seguridad

- No publiques `.env` ni compartas `JWT_SECRET` o contraseñas de Supabase.
- No se permite asignar el rol `ADMIN` desde el formulario público.
- Las contraseñas se almacenan mediante hash bcrypt.
- Las consultas de transacciones seleccionan campos explícitos y no exponen hashes de contraseñas.
- Las operaciones de préstamo, devolución y reserva se ejecutan dentro de transacciones de base de datos.
