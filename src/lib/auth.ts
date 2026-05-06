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
    async jwt({ token, user, trigger }) {
      // On initial sign-in, persist user.id and plan into the JWT
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { plan: true },
        })
        token.plan = dbUser?.plan ?? 'FREE'
      }
      // Allow manual session refresh to pick up plan changes
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true },
        })
        token.plan = dbUser?.plan ?? 'FREE'
      }
      return token
    },
    async session({ session, token }) {
      // Make user.id and plan available on the client via session
      if (session.user && token.id) {
        session.user.id = token.id as string
        ;(session.user as any).plan = token.plan as string
      }
      return session
    },
  },
})
