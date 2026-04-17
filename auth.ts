import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';
import { ensureDatabaseSchema, prisma } from '@/lib/prisma';
import * as bcryptjs from 'bcryptjs';
import { LoginSchema } from '@/lib/validations/usuario.schema';
import { CORREO_SUPREMO } from '@/lib/services/cuentas-autorizadas';

const BOOTSTRAP_ADMIN_COOKIE = 'bootstrap-admin-hash';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await ensureDatabaseSchema();
        } catch {
          // Permite fallback sin base de datos para la cuenta admin suprema.
        }

        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const cookieStore = cookies();
        const bootstrapHash = cookieStore.get(BOOTSTRAP_ADMIN_COOKIE)?.value;

        let usuario: {
          id: string;
          email: string;
          nombre: string;
          password: string;
          rol: string;
        } | null = null;

        try {
          usuario = await prisma.usuario.findUnique({
            where: { email },
          });
        } catch {
          usuario = null;
        }

        if (!usuario) {
          if (email === CORREO_SUPREMO && bootstrapHash) {
            const esValidaBootstrap = await bcryptjs.compare(password, bootstrapHash);
            if (!esValidaBootstrap) {
              return null;
            }

            return {
              id: 'bootstrap-admin',
              email: CORREO_SUPREMO,
              name: 'Juan Gutierrez',
              role: 'ADMIN',
            };
          }

          return null;
        }

        const esValida = await bcryptjs.compare(password, usuario.password);
        if (!esValida) {
          return null;
        }

        const role = email === CORREO_SUPREMO ? 'ADMIN' : usuario.rol;

        if (usuario.rol !== role) {
          await prisma.usuario.update({
            where: { id: usuario.id },
            data: { rol: role },
          });
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as typeof token & {
        id?: string;
        role?: string;
      };

      if (user) {
        authToken.id = user.id;
        authToken.role = user.role;
      }
      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as typeof token & {
        id?: string;
        role?: string;
      };

      if (session.user) {
        session.user.id = authToken.id as string;
        session.user.role = authToken.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
});

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
    };
  }
}
