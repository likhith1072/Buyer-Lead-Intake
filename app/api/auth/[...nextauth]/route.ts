import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/src/index";
import bcrypt from "bcrypt";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        if (!user[0] || !user[0].password) return null;

        const isValid = await bcrypt.compare(credentials.password, user[0].password);
        if (!isValid) return null;

        return { id: user[0].id, name: user[0].name, email: user[0].email };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt", // ✅ now valid
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
 