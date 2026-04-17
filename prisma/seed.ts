import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Iniciando seed de base de datos...');

  console.log('Limpiando datos anteriores...');
  await prisma.reserva.deleteMany();
  await prisma.salon.deleteMany();
  await prisma.bloque.deleteMany();
  await prisma.sede.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cuentaAutorizada.deleteMany();

  console.log('Creando sedes...');
  const sedeA = await prisma.sede.create({
    data: {
      nombre: 'Campus A',
      ubicacion: 'Zona Centro - Calle Principal 123',
    },
  });

  const sedeB = await prisma.sede.create({
    data: {
      nombre: 'Campus B',
      ubicacion: 'Zona Norte - Avenida Universidad 456',
    },
  });

  console.log('Creando bloques...');
  const bloquesA = [
    { nombre: 'A-1', sedeId: sedeA.id },
    { nombre: 'A-2', sedeId: sedeA.id },
  ];

  const bloquesB = [
    { nombre: 'B-1', sedeId: sedeB.id },
    { nombre: 'B-2', sedeId: sedeB.id },
    { nombre: 'B-3', sedeId: sedeB.id },
    { nombre: 'B-4', sedeId: sedeB.id },
  ];

  const bloquesCreados = await Promise.all([
    ...bloquesA.map((bloque) => prisma.bloque.create({ data: bloque })),
    ...bloquesB.map((bloque) => prisma.bloque.create({ data: bloque })),
  ]);

  console.log('Creando salones...');
  const salonesData = [
    { nombre: 'A-101', capacidad: 30, bloqueId: bloquesCreados[0].id },
    { nombre: 'A-102', capacidad: 25, bloqueId: bloquesCreados[0].id },
    { nombre: 'A-103', capacidad: 40, bloqueId: bloquesCreados[0].id },
    { nombre: 'A-104', capacidad: 35, bloqueId: bloquesCreados[0].id },
    { nombre: 'A-105', capacidad: 20, bloqueId: bloquesCreados[0].id },
    { nombre: 'A-201', capacidad: 50, bloqueId: bloquesCreados[1].id },
    { nombre: 'A-202', capacidad: 45, bloqueId: bloquesCreados[1].id },
    { nombre: 'A-203', capacidad: 30, bloqueId: bloquesCreados[1].id },
    { nombre: 'A-204', capacidad: 35, bloqueId: bloquesCreados[1].id },
    { nombre: 'A-205', capacidad: 25, bloqueId: bloquesCreados[1].id },
    { nombre: 'B-101', capacidad: 40, bloqueId: bloquesCreados[2].id },
    { nombre: 'B-102', capacidad: 35, bloqueId: bloquesCreados[2].id },
    { nombre: 'B-103', capacidad: 30, bloqueId: bloquesCreados[2].id },
    { nombre: 'B-104', capacidad: 25, bloqueId: bloquesCreados[2].id },
    { nombre: 'B-201', capacidad: 60, bloqueId: bloquesCreados[3].id },
    { nombre: 'B-202', capacidad: 55, bloqueId: bloquesCreados[3].id },
    { nombre: 'B-203', capacidad: 40, bloqueId: bloquesCreados[3].id },
    { nombre: 'B-204', capacidad: 35, bloqueId: bloquesCreados[3].id },
    { nombre: 'B-301', capacidad: 30, bloqueId: bloquesCreados[4].id },
    { nombre: 'B-302', capacidad: 25, bloqueId: bloquesCreados[4].id },
    { nombre: 'B-303', capacidad: 40, bloqueId: bloquesCreados[4].id },
    { nombre: 'B-304', capacidad: 35, bloqueId: bloquesCreados[4].id },
    { nombre: 'B-401', capacidad: 50, bloqueId: bloquesCreados[5].id },
    { nombre: 'B-402', capacidad: 45, bloqueId: bloquesCreados[5].id },
    { nombre: 'B-403', capacidad: 30, bloqueId: bloquesCreados[5].id },
    { nombre: 'B-404', capacidad: 35, bloqueId: bloquesCreados[5].id },
  ];

  const salonesConSede = salonesData.map((salon) => ({
    ...salon,
    sedeId: salon.nombre.startsWith('A') ? sedeA.id : sedeB.id,
  }));

  await Promise.all(salonesConSede.map((salon) => prisma.salon.create({ data: salon })));

  console.log('Creando cuentas autorizadas...');
  await prisma.cuentaAutorizada.createMany({
    data: [
      {
        email: 'juan.gutierrez20@usa.edu.co',
        nombre: 'Juan Gutierrez',
        rol: 'ADMIN',
        activa: true,
        registrada: true,
      },
      {
        email: 'profesor1@usa.edu.co',
        nombre: 'Profesor Uno',
        rol: 'PROFESOR',
        activa: true,
        registrada: true,
      },
      {
        email: 'profesor2@usa.edu.co',
        nombre: 'Profesor Dos',
        rol: 'PROFESOR',
        activa: true,
        registrada: true,
      },
    ],
  });

  console.log('Creando usuarios...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.usuario.create({
    data: {
      email: 'juan.gutierrez20@usa.edu.co',
      nombre: 'Juan Gutierrez',
      password: passwordHash,
      rol: 'ADMIN',
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'profesor1@usa.edu.co',
      nombre: 'Profesor Uno',
      password: passwordHash,
      rol: 'PROFESOR',
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'profesor2@usa.edu.co',
      nombre: 'Profesor Dos',
      password: passwordHash,
      rol: 'PROFESOR',
    },
  });

  console.log('Seed completado exitosamente');
  console.log('Datos creados:');
  console.log('  - Sedes: 2');
  console.log('  - Bloques: 6');
  console.log('  - Salones: 26');
  console.log('  - Cuentas autorizadas: 3');
  console.log('  - Usuarios: 3');
  console.log('Credenciales de prueba:');
  console.log('  - Admin: juan.gutierrez20@usa.edu.co / Password123!');
  console.log('  - Profesor 1: profesor1@usa.edu.co / Password123!');
  console.log('  - Profesor 2: profesor2@usa.edu.co / Password123!');
}

main()
  .catch((error) => {
    console.error('Error durante seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
