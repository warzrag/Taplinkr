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
  }
}