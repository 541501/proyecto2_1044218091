import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

/**
 * Script de seed para llenar la base de datos con datos iniciales
 *
 * Se ejecuta con:
 *   pnpm prisma db seed
 *
 * Data a insertar:
 * - 2 sedes (Campus A, Campus B)
 * - 6 bloques (A-1, A-2, B-1, B-2, B-3, B-4)
 * - 26 salones con diferentes capacidades
 * - 3 usuarios de prueba (1 ADMIN, 2 PROFESOR)
 */

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // Limpiar datos existentes
  console.log("🗑️ Limpiando datos anteriores...");
  await prisma.reserva.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.bloque.deleteMany();
  await prisma.sede.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.session.deleteMany();

  // 1. Crear SEDES
  console.log("📍 Creando sedes...");
  const sedeA = await prisma.sede.create({
    data: {
      nombre: "Campus A",
      ubicacion: "Zona Centro - Calle Principal 123",
    },
  });

  const sedeB = await prisma.sede.create({
    data: {
      nombre: "Campus B",
      ubicacion: "Zona Norte - Avenida Universidad 456",
    },
  });

  // 2. Crear BLOQUES
  console.log("🏢 Creando bloques...");
  const bloquesA = [
    { nombre: "A-1", sedeId: sedeA.id },
    { nombre: "A-2", sedeId: sedeA.id },
  ];

  const bloquesBContent = [
    { nombre: "B-1", sedeId: sedeB.id },
    { nombre: "B-2", sedeId: sedeB.id },
    { nombre: "B-3", sedeId: sedeB.id },
    { nombre: "B-4", sedeId: sedeB.id },
  ];

  const bloquesCreados = await Promise.all([
    ...bloquesA.map((b) => prisma.bloque.create({ data: b })),
    ...bloquesBContent.map((b) => prisma.bloque.create({ data: b })),
  ]);

  // 3. Crear SALONES (26 totales)
  console.log("🚪 Creando salones...");

  const salonesData = [
    // Bloque A-1 (5 salones)
    { nombre: "A-101", capacidad: 30, bloqueId: bloquesCreados[0].id },
    { nombre: "A-102", capacidad: 25, bloqueId: bloquesCreados[0].id },
    { nombre: "A-103", capacidad: 40, bloqueId: bloquesCreados[0].id },
    { nombre: "A-104", capacidad: 35, bloqueId: bloquesCreados[0].id },
    { nombre: "A-105", capacidad: 20, bloqueId: bloquesCreados[0].id },

    // Bloque A-2 (5 salones)
    { nombre: "A-201", capacidad: 50, bloqueId: bloquesCreados[1].id },
    { nombre: "A-202", capacidad: 45, bloqueId: bloquesCreados[1].id },
    { nombre: "A-203", capacidad: 30, bloqueId: bloquesCreados[1].id },
    { nombre: "A-204", capacidad: 35, bloqueId: bloquesCreados[1].id },
    { nombre: "A-205", capacidad: 25, bloqueId: bloquesCreados[1].id },

    // Bloque B-1 (4 salones)
    { nombre: "B-101", capacidad: 40, bloqueId: bloquesCreados[2].id },
    { nombre: "B-102", capacidad: 35, bloqueId: bloquesCreados[2].id },
    { nombre: "B-103", capacidad: 30, bloqueId: bloquesCreados[2].id },
    { nombre: "B-104", capacidad: 25, bloqueId: bloquesCreados[2].id },

    // Bloque B-2 (4 salones)
    { nombre: "B-201", capacidad: 60, bloqueId: bloquesCreados[3].id },
    { nombre: "B-202", capacidad: 55, bloqueId: bloquesCreados[3].id },
    { nombre: "B-203", capacidad: 40, bloqueId: bloquesCreados[3].id },
    { nombre: "B-204", capacidad: 35, bloqueId: bloquesCreados[3].id },

    // Bloque B-3 (4 salones)
    { nombre: "B-301", capacidad: 30, bloqueId: bloquesCreados[4].id },
    { nombre: "B-302", capacidad: 25, bloqueId: bloquesCreados[4].id },
    { nombre: "B-303", capacidad: 40, bloqueId: bloquesCreados[4].id },
    { nombre: "B-304", capacidad: 35, bloqueId: bloquesCreados[4].id },

    // Bloque B-4 (4 salones)
    { nombre: "B-401", capacidad: 50, bloqueId: bloquesCreados[5].id },
    { nombre: "B-402", capacidad: 45, bloqueId: bloquesCreados[5].id },
    { nombre: "B-403", capacidad: 30, bloqueId: bloquesCreados[5].id },
    { nombre: "B-404", capacidad: 35, bloqueId: bloquesCreados[5].id },
  ];

  // Agregar sedeId a todos los salones
  const salonesConSede = salonesData.map((s) => ({
    ...s,
    sedeId: s.nombre.startsWith("A") ? sedeA.id : sedeB.id,
  }));

  await Promise.all(
    salonesConSede.map((s) => prisma.salon.create({ data: s }))
  );

  // 4. Crear USUARIOS
  console.log("👥 Creando usuarios...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.usuario.create({
    data: {
      email: "admin@classsport.local",
      nombre: "Admin ClassSport",
      password: passwordHash,
      rol: "ADMIN",
    },
  });

  const profesor1 = await prisma.usuario.create({
    data: {
      email: "profesor1@classsport.local",
      nombre: "Dr. Juan Pérez",
      password: passwordHash,
      rol: "PROFESOR",
    },
  });

  const profesor2 = await prisma.usuario.create({
    data: {
      email: "profesor2@classsport.local",
      nombre: "Dra. María García",
      password: passwordHash,
      rol: "PROFESOR",
    },
  });

  console.log("✅ Seed completado exitosamente!");
  console.log("\n📋 Datos creados:");
  console.log(`   • Sedes: 2`);
  console.log(`   • Bloques: 6`);
  console.log(`   • Salones: 26`);
  console.log(`   • Usuarios: 3 (1 ADMIN, 2 PROFESOR)`);
  console.log("\n🔑 Credenciales de prueba:");
  console.log(`   • Admin: admin@classsport.local / password123`);
  console.log(`   • Profesor 1: profesor1@classsport.local / password123`);
  console.log(`   • Profesor 2: profesor2@classsport.local / password123`);
}

main()
  .catch((e) => {
    console.error("❌ Error durante seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
