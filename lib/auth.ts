import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { checkRateLimit, resetRateLimit, RateLimitPresets } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password })

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        // 🔥 RATE LIMITING - Protection contre brute force
        const rateLimitResult = checkRateLimit(
          credentials.email,
          RateLimitPresets.AUTH_LOGIN
        )

        if (!rateLimitResult.success) {
          console.log('🚫 Rate limit exceeded for:', credentials.email)
          throw new Error('RATE_LIMIT_EXCEEDED')
        }

        console.log('✅ Rate limit OK - Remaining attempts:', rateLimitResult.remaining)

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('👤 User found:', {
            exists: !!user,
            hasPassword: !!(user?.password),
            email: user?.email
          })

          if (!user || !user.password) {
            console.log('❌ User not found or no password')
            return null
          }

          if (user.isActive === false) throw new Error('ACCOUNT_DISABLED')

          console.log('🔍 Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          // ✅ Connexion réussie - Réinitialiser le rate limit
          resetRateLimit(credentials.email)
          // Bloquer les connexions email/mot de passe tant que l'email n'est pas verifie.
          if (!user.emailVerified) {
            console.log('❌ Email not verified')
            throw new Error('EMAIL_NOT_VERIFIED')
          }

          
          console.log('✅ Auth successful for:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            plan: user.plan,
            planExpiresAt: user.planExpiresAt,
            sessionVersion: user.sessionVersion,
            teamId: user.teamId,
            teamRole: user.teamRole,
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
          // Re-throw pour que NextAuth puisse gérer l'erreur correctement
          if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
            throw error
          }
          if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
            throw error
          }
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Si c'est une connexion Google
      if (account?.provider === 'google') {
        const email = user.email!
        
        try {
          // Chercher si l'utilisateur existe déjà
          let dbUser = await prisma.user.findUnique({
            where: { email }
          })

          if (!dbUser) {
            // Créer un nouvel utilisateur
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
            let username = baseUsername
            let counter = 1

            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`
              counter++
            }

            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || email.split('@')[0],
                username,
                image: user.image,
                emailVerified: true, // Google vérifie déjà l'email
                password: '', // Pas de mot de passe pour OAuth
                role: 'user',
                plan: 'free'
              }
            })
          } else {
            if (dbUser.isActive === false) return false
            // Mettre à jour l'image si elle a changé
            if (user.image && user.image !== dbUser.image) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { 
                  image: user.image,
                  emailVerified: true // S'assurer que l'email est vérifié
                }
              })
            }
          }

          // Ajouter les infos dans user pour le callback JWT
          user.id = dbUser.id
          ;(user as any).username = dbUser.username
          ;(user as any).role = dbUser.role
          ;(user as any).plan = dbUser.plan
          ;(user as any).planExpiresAt = dbUser.planExpiresAt
          ;(user as any).sessionVersion = dbUser.sessionVersion
          ;(user as any).teamId = dbUser.teamId
          ;(user as any).teamRole = dbUser.teamRole
          
          return true
        } catch (error) {
          console.error('Erreur lors de la connexion Google:', error)
          return false
        }
      }
      
      return true
    },
    jwt: async ({ token, user, trigger }) => {
      if (user) {
        // Première connexion : stocker les infos
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
        token.plan = (user as any).plan
        token.planExpiresAt = (user as any).planExpiresAt
        token.sessionVersion = (user as any).sessionVersion
        token.teamId = (user as any).teamId
        token.teamRole = (user as any).teamRole
        token.validatedAt = Date.now()
      } else if (
        token.id &&
        (
          trigger === 'update' ||
          typeof token.validatedAt !== 'number' ||
          Date.now() - token.validatedAt > 5 * 60 * 1000
        )
      ) {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            username: true,
            role: true,
            plan: true,
            planExpiresAt: true,
            sessionVersion: true,
            teamId: true,
            teamRole: true,
            isActive: true,
          },
        })

        if (!refreshedUser || refreshedUser.isActive === false) {
          token.invalid = true
          return token
        }

        if (
          token.sessionVersion !== undefined &&
          token.sessionVersion !== refreshedUser.sessionVersion
        ) {
          token.invalid = true
          return token
        }

        token.username = refreshedUser.username
        token.role = refreshedUser.role
        token.plan = refreshedUser.plan
        token.planExpiresAt = refreshedUser.planExpiresAt
        token.sessionVersion = refreshedUser.sessionVersion
        token.teamId = refreshedUser.teamId
        token.teamRole = refreshedUser.teamRole
        token.validatedAt = Date.now()
      }
      return token
    },
    session: async ({ session, token }) => {
      if (!token || !token.id || (token as any).invalid) {
        // Si le token est null, invalide ou marqué comme invalide
        // Retourner une session vide pour forcer la reconnexion
        return { ...session, user: { ...session.user, id: '' } }
      }

      session.user.id = token.id as string
      session.user.username = token.username as string
      const configuredAdminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean)
      const isConfiguredAdmin = Boolean(
        session.user.email && configuredAdminEmails.includes(session.user.email.toLowerCase())
      )
      session.user.role = isConfiguredAdmin ? 'admin' : token.role as string
      session.user.plan = token.plan as string
      session.user.planExpiresAt = token.planExpiresAt as Date | null
      session.user.teamId = token.teamId as string | null
      session.user.teamRole = token.teamRole as string | null

      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}
