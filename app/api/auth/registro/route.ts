import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ensureDatabaseSchema, prisma } from '@/lib/prisma';
import { RegistroApiSchema } from '@/lib/validations/usuario.schema';
import { CORREO_SUPREMO } from '@/lib/services/cuentas-autorizadas';

const BOOTSTRAP_ADMIN_COOKIE = 'bootstrap-admin-hash';

export async function POST(request: NextRequest) {
  try {
    try {
      await ensureDatabaseSchema();
    } catch {
      // Si la base falla en producción, permitimos bootstrap del admin supremo por cookie.
    }
    const body = await request.json();
    const validation = RegistroApiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validacion fallida', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { nombre, email, password } = validation.data;

    let usuarioExistente = null;
    try {
      usuarioExistente = await prisma.usuario.findUnique({
        where: { email },
      });
    } catch {
      usuarioExistente = null;
    }

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El correo ya esta registrado' },
        { status: 409 }
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const rol = email === CORREO_SUPREMO ? 'ADMIN' : 'PROFESOR';

    try {
      const usuario = await prisma.usuario.create({
        data: {
          nombre,
          email,
          password: passwordHash,
          rol,
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          createdAt: true,
        },
      });

      return NextResponse.json(usuario, { status: 201 });
    } catch (dbError) {
      if (email === CORREO_SUPREMO) {
        const response = NextResponse.json(
          {
            id: 'bootstrap-admin',
            nombre,
            email,
            rol: 'ADMIN',
            createdAt: new Date().toISOString(),
            bootstrap: true,
          },
          { status: 201 }
        );

        response.cookies.set(BOOTSTRAP_ADMIN_COOKIE, passwordHash, {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
        });

        return response;
      }

      throw dbError;
    }
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
