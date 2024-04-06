import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const useSecureCookies = (process.env.NEXTAUTH_URL as string).startsWith(
  "https://"
);
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = new URL(process.env.NEXTAUTH_URL as string).hostname;

const prisma = new PrismaClient();

console.log("1", "." + hostName);

export default NextAuth({
  // session: {
  //   strategy: "jwt",
  //   maxAge: 1000 * 60 * 60 * 24,
  // },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  callbacks: {
    async session({ session, token, user }) {
      const sessionUser = { ...session.user, ...user };
      return Promise.resolve({
        ...session,
        user: sessionUser,
      });
    },
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        domain: "imessage.up.railway.app",
        secure: useSecureCookies,
      },
    },
  },
});
