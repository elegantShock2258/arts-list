import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.UPLOAD_ALLOWED_EMAIL;

      if (!allowedEmail || !user.email) {
        return false;
      }

      return user.email.toLowerCase() === allowedEmail.toLowerCase();
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
