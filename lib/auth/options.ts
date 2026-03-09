import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateSingleUser } from "./single-user";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null;

        const user = await authenticateSingleUser(credentials.password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user = { ...session.user, id: token.userId as string };
      }
      return session;
    },
  },
};
