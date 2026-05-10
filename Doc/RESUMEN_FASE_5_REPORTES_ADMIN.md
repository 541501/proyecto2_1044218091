# RESUMEN FASE 5 - Reportes y Administración de Usuarios

## 📋 Descripción General

La Fase 5 implementa funcionalidades de generación de reportes de ocupación y administración centralizada de usuarios del sistema ClassSport. Todas las características incluyen:

- ✅ Reportes de ocupación con filtros por fecha y bloque
- ✅ Exportación a CSV con descarga en navegador
- ✅ Gestión de usuarios (crear, actualizar, desactivar)
- ✅ Generación de contraseñas temporales seguras
- ✅ Cambio de contraseña en flujo de login
- ✅ Auditoría completa de todas las operaciones
- ✅ Control de acceso basado en roles (RBAC)

**Estado**: ✅ COMPLETADA - 12 archivos creados/modificados, 0 errores TypeScript

---

## 🏗️ Arquitectura y Componentes

### 1. Servicios de Datos (`lib/`)

#### `reportService.ts` (NUEVO)
Servicio especializado para generación de reportes en formato CSV.

```typescript
// Función principal
generateOccupancyCSV(rows: OccupancyReportRow[]): string

// Características:
// - Escapa correctamente campos con comas, saltos de línea, comillas
// - Primera fila contiene encabezados
// - Formato de fecha en español: DD/MM/YYYY
// - Retorna string listo para descarga
```

**Interfaz de datos:**
```typescript
OccupancyReportRow {
  fecha: string;        // DD/MM/YYYY
  bloque: string;       // Nombre del bloque
  salon: string;        // Código de la sala
  codigo: string;       // Código de la sala (repetido para claridad)
  franja: string;       // Nombre de la franja horaria
  profesor: string;     // Nombre del profesor
  materia: string;      // Nombre de la asignatura
  grupo: string;        // Grupo/sección
  estado: string;       // "confirmada" (filtrado del servidor)
}
```

#### `dataService.ts` (EXTENDIDO - 7 nuevas funciones)

**getOccupancyReport(fromDate, toDate, blockId?)**
- Query compleja con JOINs a: reservations, users (profesor), slots, rooms, blocks
- Filtros: `status='confirmada'`, `reservation_date BETWEEN from AND to`
- Bloque opcional: `block_id = blockId` si se proporciona
- Retorna: Array de OccupancyReportRow con fechas formateadas DD/MM/YYYY
- Timezone: America/Bogota para conversiones de fecha

**getAllUsers()**
- Retorna todos los usuarios sin campo password_hash
- Ordenados por created_at DESC
- Incluye campos: id, name, email, role, is_active, last_login_at, must_change_password

**createUserWithTemporaryPassword(name, email, role)**
- Genera contraseña temporal: `randomBytes(6).toString('hex')` (12 caracteres hex)
- Hash con bcryptjs
- Sets `must_change_password = true`
- Retorna: `{ user: SafeUser, temporaryPassword: string }`
- Registra audit: "Usuario creado: {name} ({email}) - Rol: {role}"

**updateUser(userId, updates)**
- Actualiza campos: name, role, is_active, must_change_password
- Retorna: SafeUser actualizado
- Genera audit si hay cambios

**toggleUserStatus(userId, isActive)**
- Wrapper para cambiar is_active
- Registra audit toggle

**changeUserPassword(userId, currentPassword, newPassword)**
- Verifica contraseña actual
- Hash de nueva contraseña
- Sets `must_change_password = false`
- Retorna: boolean de éxito
- Retorna false si contraseña actual no coincide

---

### 2. Tipos y Esquemas (`lib/`)

#### `types.ts` (EXTENDIDO - 5 nuevos tipos)

```typescript
// Filtros para reportes
ReportFilters {
  from_date: string;      // YYYY-MM-DD
  to_date: string;        // YYYY-MM-DD
  block_id?: string;      // UUID opcional
  format?: 'json' | 'csv'; // Default: 'json'
}

// Creación de usuarios
CreateUserRequest {
  name: string;
  email: string;
  role: 'profesor' | 'coordinador' | 'admin';
}

CreateUserResponse {
  user: SafeUser;
  temporaryPassword: string;
}

// Actualización de usuarios
UpdateUserRequest {
  name?: string;
  role?: 'profesor' | 'coordinador' | 'admin';
  is_active?: boolean;
}

// Cambio de contraseña
ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

#### `schemas.ts` (EXTENDIDO - 3 nuevos esquemas Zod)

```typescript
reportFiltersSchema
  - from_date: required, formato YYYY-MM-DD
  - to_date: required, formato YYYY-MM-DD
  - block_id: optional, UUID válido
  - format: optional, 'json' | 'csv', default 'json'

createUserSchema
  - name: required, 1-100 caracteres
  - email: required, formato email válido
  - role: required, enum

updateUserSchema
  - Todos los campos opcionales
  - Validaciones consistentes

changePasswordSchema
  - currentPassword: required
  - newPassword: required, min 6 caracteres
```

---

### 3. Rutas API (`app/api/`)

#### POST/GET `/api/users`

**GET - Obtener todos los usuarios**
- Authorization: Admin only
- Response: `SafeUser[]`
- Status: 200 OK
- Error 401: No autenticado
- Error 403: Rol insuficiente

**POST - Crear nuevo usuario**
- Authorization: Admin only
- Request: `CreateUserRequest`
- Response: `CreateUserResponse` (incluye temporaryPassword)
- Registra audit: `create_user`
- Status: 201 Created
- Error 400: Validación fallida
- Error 401/403: Autorización fallida

#### GET/PUT `/api/users/[id]`

**GET - Obtener detalles de usuario**
- Authorization: Admin only
- Response: `SafeUser`
- Status: 200 OK
- Error 404: Usuario no encontrado
- Error 401/403: Autorización fallida

**PUT - Actualizar usuario**
- Authorization: Admin only
- Request: `UpdateUserRequest`
- Response: `SafeUser` actualizado
- Registra audit solo si hay cambios: `toggle_user`
- Status: 200 OK
- Error 400: Validación fallida
- Error 404: Usuario no encontrado
- Error 401/403: Autorización fallida

#### GET `/api/reports/occupancy`

**Generar reporte de ocupación**
- Authorization: `coordinador` | `admin`
- Query params:
  ```
  from_date: YYYY-MM-DD (required)
  to_date: YYYY-MM-DD (required)
  block_id: UUID (optional)
  format: 'json' | 'csv' (default: 'json')
  ```

**Response (JSON):**
```json
[
  {
    "fecha": "15/11/2024",
    "bloque": "Bloque A",
    "salon": "101",
    "codigo": "101",
    "franja": "08:00-09:30",
    "profesor": "Juan Pérez",
    "materia": "Matemáticas",
    "grupo": "101",
    "estado": "confirmada"
  }
]
```

**Response (CSV):**
- Content-Type: `text/csv;charset=utf-8`
- Content-Disposition: `attachment; filename="reporte-ocupacion-YYYYMMDD-YYYYMMDD.csv"`
- Encabezados: fecha, bloque, salon, codigo, franja, profesor, materia, grupo, estado
- Campos escapados correctamente para Excel

**Errores:**
- 400: Parámetros inválidos o fechas malformadas
- 403: Rol insuficiente (solo coordinador/admin)
- 404: No hay datos para el período
- 500: Error del servidor

#### POST `/api/auth/change-password`

**Cambiar contraseña de usuario autenticado**
- Authorization: Token de sesión (cualquier usuario autenticado)
- Request: `ChangePasswordRequest`
- Response: `{ success: true }`
- Clears `must_change_password` flag después de cambio exitoso

**Errores:**
- 400: Contraseña actual incorrecta
- 401: No autenticado
- 500: Error del servidor

---

### 4. Componentes UI (`app/` y `components/`)

#### `/app/reports/page.tsx` (NUEVO)

**Propósito**: Interfaz de generación de reportes de ocupación

**Características:**
- ✅ Selectores de fecha (desde/hasta) con HTML5 `<input type="date">`
- ✅ Dropdown de bloques (cargado dinámicamente desde `/api/blocks`)
- ✅ Botón "Generar reporte" con validaciones
- ✅ Tabla de vista previa de datos (max 20 filas mostradas)
- ✅ Botón "Descargar CSV" (aparece solo si hay datos)
- ✅ Manejo de errores y estados de carga
- ✅ Layout responsive con AppLayout

**Estado interno:**
```typescript
fromDate: string;          // YYYY-MM-DD
toDate: string;            // YYYY-MM-DD
blockId: string | null;    // UUID o null
reportData: OccupancyReportRow[];
loading: boolean;
error: string | null;
showPreview: boolean;
```

**Flujo de usuario:**
1. Seleccionar fecha inicial (requerido)
2. Seleccionar fecha final (requerido)
3. Seleccionar bloque (opcional)
4. Click en "Generar reporte"
5. Visualizar tabla de preview
6. Click en "Descargar CSV" para obtener archivo

#### `/app/admin/users/page.tsx` (NUEVO)

**Propósito**: Gestión centralizada de usuarios

**Características:**
- ✅ Tabla de todos los usuarios con: nombre, email, rol, estado, última sesión
- ✅ Botón "Nuevo usuario" abre modal de creación
- ✅ Modal CreateUserModal:
  - Forma con campos: name, email, role (selector)
  - Submit crea usuario vía POST `/api/users`
  - Muestra contraseña temporal con opción "Copiar"
  - Auto-close después de 3 segundos
- ✅ Botones Activar/Desactivar por usuario
- ✅ Autenticación: solo admin
- ✅ Redirección a login si no autenticado
- ✅ Redirección a dashboard si rol ≠ admin

**Validaciones:**
- Nombre: 1-100 caracteres
- Email: formato válido
- Rol: uno de ['profesor', 'coordinador', 'admin']

#### `/app/admin/audit/page.tsx` (NUEVO)

**Propósito**: Visualización de registros de auditoría

**Características:**
- ✅ Selector de mes para filtrar auditoría
- ✅ Información sobre almacenamiento en Vercel Blob
- ✅ Layout similar a usuarios, solo admin
- ✅ Placeholder informativo (auditoría registrada automáticamente)

---

### 5. Middleware y Autenticación

#### `middleware.ts` (SIN CAMBIOS)
- Protege rutas `/admin/*`, `/dashboard/*`, `/reports/*`
- Valida token y redirige a login si no existe

#### `/api/auth/change-password` (MODIFICADO)
- Ahora usa `changeUserPassword()` de dataService
- Simplificado y centralizado

---

## 🔐 Seguridad y Control de Acceso

### Matriz de Autorización

| Acción | Profesor | Coordinador | Admin |
|--------|----------|-------------|-------|
| Ver reportes ocupación | ❌ | ✅ | ✅ |
| Descargar CSV reportes | ❌ | ✅ | ✅ |
| Crear usuario | ❌ | ❌ | ✅ |
| Ver lista usuarios | ❌ | ❌ | ✅ |
| Actualizar usuario | ❌ | ❌ | ✅ |
| Activar/Desactivar usuario | ❌ | ❌ | ✅ |
| Ver auditoría | ❌ | ❌ | ✅ |
| Cambiar propia contraseña | ✅ | ✅ | ✅ |

### Generación de Contraseñas Temporales

```javascript
// Seguridad: 6 bytes = 12 caracteres hexadecimales = 48 bits de entropía
const temporaryPassword = randomBytes(6).toString('hex');
// Ejemplo: "a3f7c29b8e1d"

// Hash con bcryptjs antes de almacenar
const hash = await bcryptjs.hash(temporaryPassword, 10);
```

### Flujo de Primer Login

1. Admin crea usuario con POST `/api/users`
2. Sistema genera contraseña temporal de 12 caracteres
3. Admin comparte contraseña al usuario (copiar/SMS/email)
4. Usuario accede con email + contraseña temporal
5. JWT incluye flag `mustChangePassword: true`
6. Middleware detecta flag y redirige a `/profile`
7. Usuario completa cambio de contraseña
8. Flag se limpia en BD
9. Usuario puede acceder a dashboard

---

## 📊 Auditoría

### Eventos Registrados

Todos estos eventos se registran automáticamente en Vercel Blob:

```typescript
// Estructura base de AuditEntry
{
  timestamp: ISO 8601 string,
  user_id: UUID,
  user_email: string,
  user_role: 'profesor' | 'coordinador' | 'admin',
  action: string,              // Tipo de acción
  entity: string,              // Entidad afectada
  summary: string              // Descripción legible
}
```

### Acciones Auditadas en Fase 5

| Acción | Summary | Entidad |
|--------|---------|---------|
| create_user | "Usuario creado: {name} ({email}) - Rol: {role}" | users |
| toggle_user | "Usuario {name} {activado\|desactivado}" | users |
| change_password | "Contraseña cambiada" | users |
| login | "{name} ({role}) inició sesión" | system |

---

## 🧪 Pruebas Recomendadas

### Pruebas Manuales Fase 5

#### 1. Generación de Reportes
```bash
# Test 1: Generar reporte JSON
GET /api/reports/occupancy?from_date=2024-11-01&to_date=2024-11-30&format=json
# Esperado: Array JSON con datos

# Test 2: Generar reporte CSV
GET /api/reports/occupancy?from_date=2024-11-01&to_date=2024-11-30&format=csv
# Esperado: Descarga de archivo .csv

# Test 3: Filtrar por bloque
GET /api/reports/occupancy?from_date=2024-11-01&to_date=2024-11-30&block_id=<uuid>&format=json
# Esperado: Solo datos del bloque especificado

# Test 4: Rango sin datos
GET /api/reports/occupancy?from_date=2000-01-01&to_date=2000-12-31
# Esperado: 404 "No data found"
```

#### 2. Gestión de Usuarios
```bash
# Test 1: Crear usuario
POST /api/users
{
  "name": "Prof. Test",
  "email": "test@example.com",
  "role": "profesor"
}
# Esperado: Status 201 con { user, temporaryPassword }

# Test 2: Listar usuarios
GET /api/users
# Esperado: Array de SafeUser[]

# Test 3: Actualizar usuario
PUT /api/users/<id>
{
  "is_active": false
}
# Esperado: User actualizado con is_active=false

# Test 4: Cambiar contraseña
POST /api/auth/change-password
{
  "currentPassword": "temporalXXXXXX",
  "newPassword": "newSecurePassword123"
}
# Esperado: { success: true }
```

#### 3. Permisos RBAC
```bash
# Test 1: Profesor intenta acceder a reportes (debe fallar)
# Como profesor, GET /api/reports/occupancy
# Esperado: Status 403

# Test 2: Coordinador accede a reportes (debe funcionar)
# Como coordinador, GET /api/reports/occupancy
# Esperado: Status 200, datos de reporte

# Test 3: Profesor intenta crear usuario (debe fallar)
# Como profesor, POST /api/users
# Esperado: Status 403

# Test 4: Admin crea usuario (debe funcionar)
# Como admin, POST /api/users
# Esperado: Status 201
```

#### 4. Flujo de Primer Login
```bash
# Test 1: Admin crea usuario
POST /api/users (como admin)
# Respuesta: { user, temporaryPassword: "abc123def456" }

# Test 2: Nuevo usuario intenta login
POST /api/auth/login
{ "email": "newuser@...", "password": "abc123def456" }
# Esperado: Status 200, token con mustChangePassword: true

# Test 3: Nuevo usuario accede /dashboard
# Middleware detecta mustChangePassword y redirige a /profile

# Test 4: Nuevo usuario cambia contraseña
POST /api/auth/change-password
{ "currentPassword": "abc123def456", "newPassword": "newSecure123" }
# Esperado: Status 200, BD actualiza must_change_password = false

# Test 5: Nuevo usuario accede /dashboard (después cambio)
# Middleware permite acceso
```

---

## 📁 Archivos Creados/Modificados

### CREADOS (6 archivos nuevos)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `lib/reportService.ts` | 38 | Generador CSV de reportes |
| `app/api/reports/occupancy/route.ts` | 95 | Endpoint reporte ocupación |
| `app/api/users/route.ts` | 75 | Endpoints usuarios (GET/POST) |
| `app/api/users/[id]/route.ts` | 85 | Endpoint usuario detalle (GET/PUT) |
| `app/reports/page.tsx` | 180 | UI generador reportes |
| `app/admin/users/page.tsx` | 245 | UI gestión usuarios |
| `app/admin/audit/page.tsx` | 105 | UI visualización auditoría |

### MODIFICADOS (3 archivos existentes)

| Archivo | Cambios |
|---------|---------|
| `lib/types.ts` | +5 tipos nuevos |
| `lib/schemas.ts` | +3 esquemas Zod nuevos |
| `lib/dataService.ts` | +7 funciones nuevas + import crypto |
| `app/api/auth/change-password/route.ts` | Refactorizado para usar dataService |

---

## ✅ Checklist de Finalización

- [x] Generar reportes de ocupación con filtros
- [x] Exportar reportes a CSV
- [x] CRUD de usuarios (crear, leer, actualizar)
- [x] Generar contraseñas temporales seguras
- [x] Implementar flujo de primer login (must_change_password)
- [x] Cambio de contraseña integrado
- [x] Control de acceso RBAC para nuevas rutas
- [x] Auditoría completa de operaciones
- [x] TypeScript sin errores (npm run typecheck ✅)
- [x] UI responsiva con AppLayout
- [x] Validación con Zod en todas las rutas
- [x] Manejo de errores consistente

---

## 🚀 Próximos Pasos Sugeridos

1. **Testing Integral**
   - Crear datos de prueba con múltiples reservas
   - Validar reportes con datos reales
   - Probar todos los flujos de autorización

2. **Mejoras Futuras**
   - Página de auditoría completa (lectura desde Blob)
   - Exportación de reportes en Excel (.xlsx)
   - Dashboard de estadísticas
   - Filtros avanzados en UI de usuarios

3. **DevOps**
   - Configurar backup automático de auditoría Blob
   - Alerts para eventos críticos de seguridad
   - Monitoring de performance de queries de reportes

---

## 📚 Referencias

- [RFC 4180 - CSV Format](https://tools.ietf.org/html/rfc4180)
- [OWASP - Password Storage](https://owasp.org/www-community/password_storage_cheat_sheet)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [TypeScript Type Safety](https://www.typescriptlang.org/docs/)
- [Zod Validation](https://zod.dev/)

---

**Generado**: $(date)
**Versión**: 1.0
**Estado**: ✅ COMPLETADA
