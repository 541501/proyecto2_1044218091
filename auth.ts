import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import * as bcryptjs from "bcryptjs";
import { z } from "zod";

// Esquema de validación para login
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validar credenciales
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Buscar usuario en BD
        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario) {
          return null;
        }

        // Verificar contraseña
        const esValida = await bcryptjs.compare(password, usuario.password);
        if (!esValida) {
          return null;
        }

        // Retornar datos de usuario para sesión
        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          role: usuario.rol,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/login",
    error: "/login",
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
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key",
});

// Tipos extendidos para NextAuth
declare module "next-auth" {
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
