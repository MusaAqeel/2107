import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        if (token.sub) {
          session.user.id = token.sub
        }
      }
      return session
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
} 