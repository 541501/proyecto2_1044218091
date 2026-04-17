import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import * as bcryptjs from 'bcryptjs';
import { LoginSchema } from '@/lib/validations/usuario.schema';
import { CORREO_SUPREMO } from '@/lib/services/cuentas-autorizadas';

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
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario) {
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
