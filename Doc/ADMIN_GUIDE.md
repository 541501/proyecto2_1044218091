# 📘 ADMIN_GUIDE.md — Guía de Administración ClassSport

## Para administradores de la universidad

---

## 1. Acceso al Panel de Admin

1. **Login como administrador**
   - Ir a: https://classsport.vercel.app/login
   - Email: `admin@classsport.edu` (o tu email de admin)
   - Password: [tu contraseña de admin]
   - Click "Ingresar"

2. **Ir a panel de administración**
   - Sidebar izquierda: "Administración"
   - URL directo: https://classsport.vercel.app/admin

---

## 2. Gestionar Sedes (Campus)

### Crear Nueva Sede

**Actualmente:** Las sedes se creen manualmente en base de datos (requiere acceso Neon.tech)

**Procedimiento:**
1. Acceder a Neon.tech console
2. Ejecutar query:
   ```sql
   INSERT INTO sedes (id, nombre, direccion, created_at, updated_at)
   VALUES (
     gen_random_uuid(),
     'Campus Tecnológico',
     'Calle Principal 123',
     NOW(),
     NOW()
   );
   ```
3. Recargar ClassSport → nueva sede aparece en sidebar

### Editar Sede

**Actualmente:** No hay interfaz de edición. Contactar a soporte técnico para cambios.

### Eliminar Sede

⚠️ **IMPORTANTE:** No eliminar si hay reservas activas en esa sede.

```sql
-- Verificar si hay reservas
SELECT COUNT(*) FROM reservas r
JOIN salones s ON r.salon_id = s.id
JOIN bloques b ON s.bloque_id = b.id
WHERE b.sede_id = 'uuid-of-sede';

-- Si no hay, eliminar
DELETE FROM sedes WHERE id = 'uuid-of-sede';
```

---

## 3. Gestionar Bloques (Edificios)

### Crear Nuevo Bloque

```sql
INSERT INTO bloques (id, nombre, descripcion, sede_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'A-5',  -- Nombre del bloque
  'Nuevo ala de edificios',  -- Descripción
  'uuid-of-sede',  -- ID de la sede
  NOW(),
  NOW()
);
```

### Listar Bloques de una Sede

```sql
SELECT id, nombre, descripcion FROM bloques WHERE sede_id = 'uuid-of-sede';
```

---

## 4. Gestionar Salones (Aulas)

### Crear Nuevo Salón

```sql
INSERT INTO salones (id, nombre, capacidad, bloque_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'A-501',  -- Nombre/número de salón
  40,       -- Capacidad de estudiantes
  'uuid-of-bloque',  -- ID del bloque
  NOW(),
  NOW()
);
```

### Ver Disponibilidad de un Salón

```sql
-- Salón y fecha específica
SELECT 
  horario_inicio, 
  horario_fin, 
  nombre_clase, 
  usuario_id
FROM reservas
WHERE salon_id = 'uuid-of-salon'
  AND fecha = '2026-04-13'
ORDER BY horario_inicio;
```

### Listar Todos los Salones

```sql
SELECT s.id, s.nombre, s.capacidad, b.nombre as bloque
FROM salones s
JOIN bloques b ON s.bloque_id = b.id
ORDER BY b.nombre, s.nombre;
```

---

## 5. Gestionar Usuarios

### Crear Admin Nuevo

```sql
INSERT INTO usuarios (id, email, nombre, password, rol, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'newadmin@classsport.edu',
  'Nuevo Administrador',
  -- Generar hash: node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
  '$2a$10$[hash aqui]',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Crear Profesor

```sql
INSERT INTO usuarios (id, email, nombre, password, rol, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'profesor1@universidad.edu',
  'Prof. Juan García',
  '$2a$10$[hash de contraseña]',
  'PROFESOR',
  NOW(),
  NOW()
);
```

### Listar Todos los Usuarios

```sql
SELECT id, email, nombre, rol, created_at FROM usuarios ORDER BY created_at DESC;
```

### Resetear Contraseña de Usuario

```sql
-- Generar nuevo hash primero
UPDATE usuarios
SET password = '$2a$10$[nuevo hash]'
WHERE email = 'usuario@ejemplo.com';
```

---

## 6. Monitorear Reservas

### Ver Todas las Reservas (Panel Admin)
- URL: https://classsport.vercel.app/admin
- Tabla: "Todas las Reservas"
- Filtros: Usuario, fecha, estado

### Queries útiles

```sql
-- Reservas de hoy
SELECT * FROM reservas 
WHERE fecha = CURRENT_DATE
ORDER BY horario_inicio;

-- Reservas sin confirmar (en progreso)
SELECT * FROM reservas
WHERE estado = 'PENDIENTE'
ORDER BY created_at DESC;

-- Profesor con más reservas
SELECT u.nombre, COUNT(*) as total_reservas
FROM reservas r
JOIN usuarios u ON r.usuario_id = u.id
GROUP BY u.id
ORDER BY total_reservas DESC
LIMIT 10;

-- Salón más usado
SELECT s.nombre, COUNT(*) as total_reservas
FROM reservas r
JOIN salones s ON r.salon_id = s.id
GROUP BY s.id
ORDER BY total_reservas DESC
LIMIT 5;
```

---

## 7. Cancelar Reservas como Admin

1. **Desde panel admin:**
   - Ir a https://classsport.vercel.app/admin
   - Tabla "Todas las Reservas"
   - Buscar reserva
   - Click botón "Cancelar"
   - Confirmar modal

2. **Manualmente en BD** (si interfaz no responde):
   ```sql
   UPDATE reservas
   SET estado = 'CANCELADA', updated_at = NOW()
   WHERE id = 'uuid-of-reserva';
   ```

---

## 8. Backups y Mantenimiento

### Backup de BD Automático
- Neon.tech realiza backups automáticos cada 24h
- También puedes hacer backup manual:
  ```bash
  # Exportar toda la BD
  pg_dump "postgresql://user:pass@host/db" > backup-$(date +%Y%m%d).sql
  ```

### Verificar Salud de la BD

```sql
-- Conexiones activas
SELECT COUNT(*) FROM pg_stat_activity;

-- Espacios en disco
SELECT pg_size_pretty(pg_database_size('classsport_main'));

-- Tablas más grandes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 9. Monitoreo & Alertas

### Monitorear app en producción
- **Vercel Analytics:** https://vercel.com/dashboard → Project → Analytics
- **Error tracking:** Integración con Sentry (si configurada)
- **Logs:** Vercel Logs en Dashboard

### Detectar problemas comunes

| Síntoma | Causa Probable | Acción |
|---------|---|---|
| App lenta | BD connections agotadas | Revisar Neon pools, reiniciar |
| Errores 500 en API | Environment variables falta | Verificar en Vercel settings |
| Usuarios no pueden login | BD down | Verificar Neon.tech status |
| Reservas no se guardan | Transaction deadlock | Revisar logs, rollback si necesario |

---

## 10. Contacto & Escalation

- **Technical Support:** [email]
- **Emergency (app down):** [phone]
- **Neon.tech Support:** https://neon.tech/support
- **Vercel Status:** https://vercel.com/status

---

**Última actualización:** 13 Abril 2026  
**Versión:** 1.0 Production



---

# 📗 USER_GUIDE.md — Guía para Profesores

## Cómo Reservar un Salón en ClassSport

---

## 1. Primer Acceso

### Registrarse (si nuevo usuario)
1. Ir a: https://classsport.vercel.app
2. Click "Registrarse" o "Crear cuenta"
3. Completa tu información:
   - Nombre completo
   - Email universitario (ej: tuemail@universidad.edu)
   - Contraseña (segura: 8+ caracteres, incluyendo números)
4. Click "Crear cuenta"
5. ¡Listo! Ya puedes iniciar sesión

### Iniciar Sesión
1. IR a: https://classsport.vercel.app/login
2. Ingresa tu email y contraseña
3. Click "Ingresar"
4. Serás llevado a tu Dashboard

---

## 2. Dashboard — Tu Pantalla Principal

- **Próximas Reservas:** Muestra clases que tienes reservadas (estado verde = confirmada)
- **Historial:** Tus reservas canceladas o pasadas
- **Nueva Reserva:** Botón para crear una reserva nueva
- **Mis Reservas:** Link a pantalla detallada de todas tus reservas

---

## 3. Crear Nueva Reserva — Paso a Paso

### Paso 1️⃣ — Seleccionar Sede, Bloque y Salón

1. Click botón "Nueva Reserva"
2. Modal se abre con tres dropdowns:
   - **Sede:** Selecciona campus (ej: "Campus A")
   - **Bloque:** Automáticamente filtra bloques de esa sede (ej: "A-1")
   - **Salón:** Automáticamente filtra salones del bloque (ej: "A-101")
3. Click "Siguiente >"

### Paso 2️⃣ — Seleccionar Horario (Calendario)

1. Calendario interactivo se muestra
2. **Colores:**
   - 🟢 Verde: Horario disponible (clickea)
   - ⚫ Gris: Horario ocupado (no disponible)
   
3. Click en slot VERDE para seleccionar (ej: "10:00 - 11:00")
4. Slot seleccionado se resalta (borde azul)
5. Click "Siguiente >"

### Paso 3️⃣ — Detalles de la Clase

1. Formulario final con campos:
   - **Nombre de la clase:** (REQUERIDO) Ej: "Matemáticas Básica I"
   - **Descripción:** (Opcional) Ej: "Tema: Cálculo diferencial"
   - **Resumen:** (Solo lectura) Muestra: Sede, Salón, Horario

2. Completa nombre + descripción si quieres

3. Click "Confirmar Reserva"

4. ✅ Se muestra toast de éxito: "¡Reserva creada exitosamente!"

5. Serás redirigido a tu página de "Mis Reservas"

---

## 4. Gestionar Mis Reservas

### Ver Todas Mis Reservas
1. Menu → "Mis Reservas"
2. O URL: https://classsport.vercel.app/mis-reservas

### Opciones por Reserva

**Para reservas próximas:**
- **Botón "Cancelar":** Si necesitas cancelar la clase

**Para reservas pasadas/canceladas (Historial):**
- No hay opciones (son históricas)

### Cancelar una Reserva

1. En tarjeta de reserva próxima
2. Click botón "Cancelar"
3. Se abre modal de confirmación: "¿Está seguro de que desea cancelar esta clase?"
4. Click "Sí, cancelar"
5. ✅ Reserva se cancela, pasa a "Historial"
6. Salón y horario quedan **disponibles** para otros profesores

---

## 5. Buscar Disponibilidad

### ¿Qué puedo hacer si el salón está ocupado?

1. Intenta otro **salón** en mismo bloque
2. Intenta otro **horario** en mismo salón
3. Intenta otro **bloque** o **sede**

### Tip: Horarios Populares

- 08:00-09:00, 10:00-11:00 tienden a estar ocupados
- 14:00-15:00 a 16:00-17:00 suelen tener slots libres
- Intenta temprano en la mañana (07:00-08:00) o tarde (16:00+)

---

## 6. Solucionar Problemas

### "¡No puedo iniciar sesión!"

**Problema:** Email/contraseña incorrecta  
**Acción:**
1. Verifica que escribiste email CORRECTO (sin espacios)
2. Verifica que contraseña es CORRECTA (mayúsculas vs minúsculas importan)
3. Si olvidaste: Contacta a administración

**Problema:** "Usuario no existe"  
**Acción:**
1. ¿Eres usuarios NUEVO? Haz clic "Registrarse" primero
2. Si crees que ya registrado: Contacta a admin

### "El horario está ocupado (error 409)"

**Problema:** Intentaste reservar un horario en que otra persona ya reservó  
**Acción:**
1. Selecciona otro horario VERDE en el calendario
2. O selecciona otro salón
3. El error es automático — el sistema protege conflictos

### "¿Puedo reservar dos horarios consecutivos?"

**Respuesta:** SÍ. Ejemplo:
- 10:00-11:00 ✅ (confirmada para ti)
- 11:00-12:00 ✅ (también puedes reservar — cambio de profesor permitido)

Ambos horarios pueden estar a nombre tuyo, solo son consecutivos.

### "Mi reserva no aparece"

**Acción:**
1. Recarga la página (F5)
2. Ve a "Mis Reservas" (no solo "Dashboard")
3. Verifica que NO esté en "Historial" (si fue cancelada)
4. Si sigue desaparecida: Contacta a admin

---

## 7. Tips & Mejores Prácticas

✅ **Do:**
- Reserva con anticipación (al menos 1 semana)
- Usa descripción clara (permite que otros entienda qué es la clase)
- Cancela si no necesitas para liberar el salón para otros

❌ **Don't:**
- No reserves múltiples veces el mismo salón (usa una sola reserva)
- No canceles en último momento si es posible
- No intentes "hackear" directamente la BD

---

## 8. Contacto & Soporte

- **Preguntas técnicas:** [email de soporte]
- **Reservaciones especiales:** Contacta a Administración
- **Emergencia (app no funciona):** [teléfono de escalación]

---

**Última actualización:** 13 Abril 2026  
**Versión:** 1.0 Production

