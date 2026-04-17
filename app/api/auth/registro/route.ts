import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { RegistroApiSchema } from '@/lib/validations/usuario.schema';
import { obtenerCuentaAutorizadaPorEmail, obtenerRolAutorizado } from '@/lib/services/cuentas-autorizadas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = RegistroApiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validacion fallida', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { nombre, email, password } = validation.data;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El correo ya esta registrado' },
        { status: 409 }
      );
    }

    const cuentaAutorizada = await obtenerCuentaAutorizadaPorEmail(email);

    if (!cuentaAutorizada || !cuentaAutorizada.activa) {
      return NextResponse.json(
        { error: 'Tu correo no esta autorizado para crear cuenta. Solicita acceso al administrador.' },
        { status: 403 }
      );
    }

    if (cuentaAutorizada.registrada) {
      return NextResponse.json(
        { error: 'Esta cuenta autorizada ya fue utilizada para registrarse.' },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const rol = obtenerRolAutorizado(cuentaAutorizada);

    const usuario = await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          nombre,
          email,
          password: passwordHash,
          rol,
          escuela: cuentaAutorizada.rol === 'ESCUELA' ? cuentaAutorizada.escuela ?? null : null,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          escuela: true,
          createdAt: true,
        },
      });

      await tx.cuentaAutorizada.update({
        where: { id: cuentaAutorizada.id },
        data: {
          nombre,
          rol,
          escuela: cuentaAutorizada.rol === 'ESCUELA' ? cuentaAutorizada.escuela ?? null : null,
          registrada: true,
        },
      });

      return nuevoUsuario;
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error('Registro error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validacion fallida', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
