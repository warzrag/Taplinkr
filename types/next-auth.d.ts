import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      username: string
      role: string
      plan: string
      planExpiresAt?: Date | null
      teamId?: string | null
      teamRole?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    username: string
    role: string
    plan: string
    planExpiresAt?: Date | null
    // sessionVersion: number // TODO: Réactiver après migration DB
  }
}