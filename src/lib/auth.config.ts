import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [], // injected in auth.ts
  pages: {
    signIn: '/register',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth }) {
      // The middleware.ts file handles specific routing logic
      return true;
    },
  },
} satisfies NextAuthConfig
