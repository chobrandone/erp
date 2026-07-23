import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions,
          canCreate: user.canCreate, canEdit: user.canEdit, canDelete: user.canDelete,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = (user as { id: string }).id;
        token.permissions = (user as { permissions?: string | null }).permissions ?? null;
        const u = user as { canCreate?: boolean; canEdit?: boolean; canDelete?: boolean };
        token.canCreate = u.canCreate ?? true;
        token.canEdit = u.canEdit ?? true;
        token.canDelete = u.canDelete ?? true;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as typeof session.user & {
          role: string; id: string; permissions: string[] | null;
          canCreate: boolean; canEdit: boolean; canDelete: boolean;
        };
        u.role = token.role as string;
        u.id = token.id as string;
        try {
          const raw = token.permissions as string | null;
          u.permissions = raw ? (JSON.parse(raw) as string[]) : null;
        } catch {
          u.permissions = null;
        }
        // Admins always have every action right regardless of stored flags.
        const admin = u.role === "ADMIN";
        u.canCreate = admin || token.canCreate !== false;
        u.canEdit = admin || token.canEdit !== false;
        u.canDelete = admin || token.canDelete !== false;
      }
      return session;
    },
  },
});
