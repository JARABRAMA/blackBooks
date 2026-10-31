# Requerimientos del Proyecto - Sistema de Gestión de Biblioteca
*(Historias de Usuario en Gherkin)*

## 1. Autenticación y Acceso

### HU-01: Página de aterrizaje con opción para iniciar sesión
```gherkin
Feature: Landing page
  Como visitante
  Quiero ver una página de aterrizaje con un botón para iniciar sesión
  Para poder acceder a la aplicación de la biblioteca

  Scenario: Visualizar landing page
    Given que soy un usuario no autenticado
    When ingreso a la ruta raíz "/"
    Then debo ver la página de landing
    And debo ver un botón "Iniciar sesión"
```

### HU-02: Inicio de sesión
```gherkin
Feature: Autenticación
  Como usuario registrado
  Quiero iniciar sesión con mis credenciales
  Para acceder al sistema con mis permisos

  Scenario: Inicio de sesión exitoso
    Given que soy un usuario registrado con correo y contraseña válidos
    When inicio sesión desde la página de autenticación
    Then el sistema debe autenticarme
    And debo ser redirigido al sistema con sesión iniciada

  Scenario: Inicio de sesión fallido
    Given que ingreso credenciales inválidas
    When intento iniciar sesión
    Then el sistema debe mostrar un mensaje de error
    And no debo ser autenticado
```

### HU-03: Persistencia de sesión
```gherkin
Feature: Sesión
  Como usuario autenticado
  Quiero mantener mi sesión activa
  Para navegar por el sistema sin volver a iniciar sesión

  Scenario: Mantener sesión tras recarga
    Given que tengo una sesión iniciada
    When recargo la página
    Then debo seguir autenticado
    And debo seguir viendo mi información personal en el sidebar
```

## 2. Navegación y Sidebar

### HU-04: Sidebar con información del usuario
```gherkin
Feature: Sidebar
  Como usuario autenticado
  Quiero ver mi información personal en el sidebar
  Para identificar qué usuario tiene la sesión iniciada

  Scenario: Visualizar información del usuario
    Given que tengo sesión iniciada
    When ingreso al sistema
    Then debo ver un sidebar fijo a la izquierda
    And debo ver la foto del usuario
    And debo ver el nombre del usuario
```

### HU-05: Enlaces del sidebar según rol
```gherkin
Feature: Sidebar por roles
  Como usuario autenticado
  Quiero ver únicamente los enlaces permitidos según mi rol
  Para tener acceso solo a las funcionalidades autorizadas

  Scenario: Sidebar para rol USER (Cliente / Lector)
    Given que tengo sesión iniciada con rol "USER"
    When visualizo el sidebar
    Then debo ver el enlace "Catálogo de Libros"
    And debo ver el enlace "Mis Reservas / Préstamos"
    And no debo ver el enlace "Inventario"
    And no debo ver el enlace "Usuarios"
    And no debo ver el enlace "Préstamos y Devoluciones"

  Scenario: Sidebar para rol ADMIN (Bibliotecario / Administrador)
    Given que tengo sesión iniciada con rol "ADMIN"
    When visualizo el sidebar
    Then debo ver el enlace "Catálogo de Libros"
    And debo ver el enlace "Inventario"
    And debo ver el enlace "Préstamos y Devoluciones"
    And debo ver el enlace "Usuarios"
    And debo ver el enlace "Reportes / Transacciones"
```

## 3. Catálogo de Libros (Búsqueda y Reserva)

### HU-06: Buscar libros en el catálogo
```gherkin
Feature: Catálogo de Libros
  Como usuario autenticado (USER o ADMIN)
  Quiero buscar libros por título, autor o categoría
  Para encontrar el libro que deseo consultar o reservar

  Scenario: Buscar libros exitosamente
    Given que me encuentro en la página "Catálogo de Libros"
    When ingreso un término de búsqueda (título, autor o categoría)
    Then el sistema debe filtrar y mostrar los libros que coincidan
    And debo ver la información básica de cada libro (título, autor, categoría, disponibilidad)

  Scenario: Ver libros sin resultados
    Given que realizo una búsqueda con un término que no coincide
    When se ejecuta la búsqueda
    Then el sistema debe mostrar un mensaje indicando que no se encontraron resultados
```

### HU-07: Reservar un libro
```gherkin
Feature: Reserva de Libros
  Como usuario con rol "USER" (Lector)
  Quiero reservar un libro disponible
  Para solicitarlo en préstamo en la biblioteca

  Scenario: Reservar libro disponible
    Given que me encuentro en el catálogo
    And hay ejemplares disponibles del libro
    When selecciono el libro y hago click en "Reservar"
    Then el sistema debe crear una reserva/préstamo solicitado
    And debo ver un mensaje de éxito
    And el estado del libro/exemplar debe actualizarse acorde al proceso

  Scenario: No poder reservar libro sin disponibilidad
    Given que no hay ejemplares disponibles del libro
    When intento reservarlo
    Then el sistema debe deshabilitar la opción "Reservar"
    And debe mostrar un mensaje indicando "Sin ejemplares disponibles"
```

## 4. Gestión de Inventario (Bibliotecario)

### HU-08: Visualizar inventario de libros
```gherkin
Feature: Gestión de Inventario
  Como usuario con rol "ADMIN" (Bibliotecario)
  Quiero visualizar el inventario de libros
  Para conocer el stock de cada título y el estado de los ejemplares

  Scenario: Visualizar inventario
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Inventario"
    Then debo ver una tabla con los libros registrados
    And la tabla debe mostrar: ID del libro, título, autor, categoría, total de ejemplares, ejemplares disponibles, ejemplares prestados
```

### HU-09: Agregar nuevo libro al inventario
```gherkin
Feature: Agregar libro al inventario
  Como usuario con rol "ADMIN" (Bibliotecario)
  Quiero agregar un nuevo libro o nuevos ejemplares al inventario
  Para mantener actualizado el catálogo de la biblioteca

  Scenario: Abrir diálogo para agregar libro
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Inventario"
    When hago click en el botón "Agregar libro"
    Then debo ver un diálogo para registrar el libro

  Scenario: Crear libro/exemplares exitosamente
    Given que el diálogo "Agregar libro" está abierto
    And he ingresado: título, autor, categoría, ISBN (opcional) y cantidad de ejemplares
    When hago click en el botón "Agregar"
    Then el botón debe mostrar estado de carga (loading)
    And el libro y sus ejemplares deben crearse en la base de datos
    And debo ver un mensaje de éxito
    And el diálogo debe cerrarse automáticamente
    And la tabla de inventario debe actualizarse automáticamente

  Scenario: Crear libro con error
    Given que el diálogo "Agregar libro" está abierto
    And los datos ingresados son inválidos o ocurre un error
    When hago click en el botón "Agregar"
    Then debo ver un mensaje de error
    And el diálogo no debe cerrarse
```

### HU-10: Cancelar agregar libro
```gherkin
Feature: Cancelar agregar libro
  Como usuario con rol "ADMIN"
  Quiero cancelar el registro de un libro
  Para cerrar el diálogo sin guardar cambios

  Scenario: Cancelar desde el diálogo
    Given que el diálogo "Agregar libro" está abierto
    When hago click en el botón "Cancelar"
    Then el diálogo debe cerrarse
    And no se debe registrar ningún libro
```

## 5. Préstamos, Devoluciones y Transacciones

### HU-11: Gestionar préstamos y devoluciones
```gherkin
Feature: Préstamos y Devoluciones
  Como usuario con rol "ADMIN" (Bibliotecario)
  Quiero gestionar las transacciones de préstamo y devolución
  Para controlar la circulación de los libros

  Scenario: Visualizar préstamos activos
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Préstamos y Devoluciones"
    Then debo ver una tabla con los préstamos activos
    And la tabla debe mostrar: ID de préstamo, libro, ejemplar, lector (usuario), fecha de préstamo, fecha de vencimiento, estado

  Scenario: Registrar préstamo a partir de reserva/solicitud
    Given que hay una solicitud/reserva pendiente
    And el lector se presenta a retirar el libro
    When el bibliotecario registra el préstamo
    Then el estado debe cambiar a "Prestado"
    And debe registrarse la fecha de préstamo y fecha de vencimiento
    And el ejemplar debe pasar a "No disponible"
    And debe registrarse la transacción de préstamo
```

### HU-12: Registrar devolución de libro
```gherkin
Feature: Devolución de libro
  Como usuario con rol "ADMIN" (Bibliotecario)
  Quiero registrar la devolución de un libro prestado
  Para actualizar su disponibilidad y cerrar el préstamo

  Scenario: Devolver libro a tiempo
    Given que hay un préstamo activo sin devolución
    And el libro es devuelto en la fecha o antes de la fecha de vencimiento
    When el bibliotecario registra la devolución
    Then el estado del préstamo debe cambiar a "Devuelto"
    And debe registrarse la fecha de devolución
    And el ejemplar debe volver a "Disponible"
    And debe registrarse la transacción de devolución

  Scenario: Devolver libro con retraso
    Given que hay un préstamo activo
    And la fecha de devolución es posterior a la fecha de vencimiento
    When el bibliotecario registra la devolución
    Then el sistema debe registrar la devolución
    And debe quedar registro del retraso en la transacción
    And el ejemplar debe volver a "Disponible"
```

### HU-13: Visualizar transacciones/movimientos de la biblioteca
```gherkin
Feature: Historial de Transacciones
  Como usuario con rol "ADMIN" (Bibliotecario)
  Quiero visualizar el historial de transacciones (préstamos, devoluciones, reservas)
  Para dar seguimiento a la actividad de la biblioteca

  Scenario: Visualizar historial de transacciones
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Reportes / Transacciones"
    Then debo ver una tabla con el historial de movimientos
    And la tabla debe mostrar: ID de transacción, tipo (Préstamo/Devolución/Reserva), libro, ejemplar, usuario responsable/lector, fecha, estado

  Scenario: Filtrar transacciones
    Given que me encuentro en el historial de transacciones
    When filtro por tipo de transacción o por fecha
    Then el sistema debe mostrar solo las transacciones que coincidan con el filtro
```

### HU-14: Visualizar mis préstamos/reservas
```gherkin
Feature: Mis préstamos
  Como usuario con rol "USER" (Lector)
  Quiero ver mis reservas, préstamos activos y mi historial
  Para dar seguimiento a mis solicitudes

  Scenario: Visualizar mis préstamos
    Given que tengo sesión iniciada con rol "USER"
    And me encuentro en la página "Mis Reservas / Préstamos"
    Then debo ver mis reservas activas, préstamos vigentes, préstamos vencidos (si aplica) y mi historial
    And debo ver: libro, fecha de préstamo, fecha de vencimiento, fecha de devolución, estado
```

## 6. Gestión de Usuarios

### HU-15: Visualizar usuarios del sistema
```gherkin
Feature: Gestión de Usuarios
  Como usuario con rol "ADMIN"
  Quiero visualizar la lista de usuarios registrados
  Para administrar los roles y el acceso al sistema

  Scenario: Visualizar tabla de usuarios
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Usuarios"
    Then debo ver una tabla con los usuarios del sistema
    And la tabla debe mostrar: ID del usuario, fecha de creación, correo electrónico, rol asignado
```

### HU-16: Editar rol de usuario
```gherkin
Feature: Editar rol de usuario
  Como usuario con rol "ADMIN"
  Quiero actualizar el rol de un usuario
  Para asignar o cambiar permisos (USER/ADMIN)

  Scenario: Abrir diálogo para editar rol
    Given que tengo sesión iniciada con rol "ADMIN"
    And me encuentro en la página "Usuarios"
    When hago click en el botón "Editar usuario" de un usuario
    Then debo ver un diálogo
    And el diálogo debe mostrar el correo del usuario a editar
    And debe aparecer un dropdown con los roles disponibles
    And el dropdown debe mostrar por defecto el rol actual del usuario

  Scenario: Actualizar rol exitosamente
    Given que el diálogo "Editar usuario" está abierto
    And he seleccionado un nuevo rol desde el dropdown
    When hago click en el botón "Guardar/Actualizar"
    Then el botón debe mostrar estado de carga (loading)
    And el rol del usuario debe actualizarse en la base de datos
    And debo ver un mensaje de éxito
    And el diálogo debe cerrarse automáticamente
    And la tabla de usuarios debe actualizarse automáticamente

  Scenario: Actualizar rol con error
    Given que el diálogo "Editar usuario" está abierto
    And ocurre un error al actualizar
    When hago click en el botón "Guardar/Actualizar"
    Then debo ver un mensaje de error
    And el diálogo no debe cerrarse
```

### HU-17: Cancelar edición de rol
```gherkin
Feature: Cancelar edición de rol
  Como usuario con rol "ADMIN"
  Quiero cancelar la actualización del rol
  Para cerrar el diálogo sin guardar cambios

  Scenario: Cancelar desde el diálogo
    Given que el diálogo "Editar usuario" está abierto
    When hago click en el botón "Cancelar"
    Then el diálogo debe cerrarse
    And el rol del usuario no debe modificarse
```

## 7. Reglas de Acceso y Restricciones

### HU-18: Control de acceso por rol
```gherkin
Feature: Autorización por roles
  Como sistema
  Quiero restringir el acceso a funcionalidades según el rol
  Para proteger las operaciones administrativas

  Scenario: Usuario USER intenta acceder a Inventario
    Given que tengo sesión iniciada con rol "USER"
    When intento acceder directamente a la ruta "/inventario"
    Then el sistema debe denegar el acceso
    And debo ser redirigido o ver un mensaje de "No autorizado"

  Scenario: Usuario USER intenta acceder a Usuarios
    Given que tengo sesión iniciada con rol "USER"
    When intento acceder directamente a la ruta "/usuarios"
    Then el sistema debe denegar el acceso
    And debo ser redirigido o ver un mensaje de "No autorizado"

  Scenario: Usuario USER intenta acceder a Préstamos y Devoluciones
    Given que tengo sesión iniciada con rol "USER"
    When intento acceder directamente a la ruta "/prestamos-devoluciones"
    Then el sistema debe denegar el acceso
    And debo ser redirigido o ver un mensaje de "No autorizado"

  Scenario: Solo ADMIN puede editar roles de usuario
    Given que tengo sesión iniciada con rol "USER"
    When intento acceder a la funcionalidad de editar rol
    Then el sistema debe impedir la acción
    And no debo ver el botón "Editar usuario"
```

## 8. Requisitos No Funcionales

### HU-19: Diseño responsivo
```gherkin
Feature: Responsividad
  Como usuario
  Quiero que la aplicación se adapte a diferentes tamaños de pantalla
  Para poder usarla desde desktop, tablet o móvil

  Scenario: Visualización en tablet/móvil
    Given que accedo a la aplicación desde un dispositivo con pantalla pequeña
    When navego por las páginas
    Then el sidebar debe adaptarse (ocultarse/convertirse en menú)
    And las tablas y formularios deben ser legibles y usables
```

### HU-20: Documentación
```gherkin
Feature: Documentación del proyecto
  Como evaluador
  Quiero contar con documentación clara
  Para entender el propósito, ejecución y estructura del proyecto

  Scenario: README completo
    Given que reviso el repositorio
    Then debe existir un archivo README.md
    And debe contener: propósito del proyecto, integrantes del equipo, instrucciones para ejecutar localmente, variables de entorno (.env), credenciales de prueba (usuario y administrador), enlace de despliegue en Vercel
```
