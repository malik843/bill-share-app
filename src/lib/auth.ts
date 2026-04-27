import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist user.id into the JWT
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Make user.id available on the client via session
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
