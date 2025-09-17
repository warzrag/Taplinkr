import { NextAuthOptions } from 'next-auth'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

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

          console.log('🔍 Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔑 Password valid:', isPasswordValid)
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          // Vérifier si l'email est vérifié
          if (!user.emailVerified) {
            console.log('❌ Email not verified')
            throw new Error('EMAIL_NOT_VERIFIED')
          }
          
          // Vérification d'email temporairement désactivée
          /*
          if (!user.emailVerified) {
            console.log('❌ Email not verified')
            throw new Error('EMAIL_NOT_VERIFIED')
          }
          */
          
          console.log('✅ Auth successful for:', user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            plan: user.plan,
            planExpiresAt: user.planExpiresAt
            // sessionVersion: user.sessionVersion // TODO: Réactiver après migration
          }
        } catch (error) {
          console.error('❌ Auth error:', error)
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
          // ;(user as any).sessionVersion = dbUser.sessionVersion // TODO: Réactiver
          
          return true
        } catch (error) {
          console.error('Erreur lors de la connexion Google:', error)
          return false
        }
      }
      
      return true
    },
    jwt: async ({ token, user }) => {
      if (user) {
        // Première connexion : stocker les infos
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
        token.plan = (user as any).plan
        token.planExpiresAt = (user as any).planExpiresAt
        // token.sessionVersion = (user as any).sessionVersion // TODO: Réactiver
      } else if (token.id) {
        // Vérifier si la session est toujours valide
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            // sessionVersion: true, // TODO: Réactiver après migration
            banned: true,
            teamId: true,
            teamRole: true,
            role: true,
            plan: true,
            planExpiresAt: true
          }
        })
        
        // Si l'utilisateur n'existe plus ou est banni
        if (!currentUser || currentUser.banned) {
          console.log('🚫 Session invalidée pour:', token.id)
          return null // Invalider la session
        }
        
        // TODO: Réactiver après avoir ajouté sessionVersion dans la DB
        // || currentUser.sessionVersion !== token.sessionVersion
        
        // Mettre à jour les infos qui peuvent avoir changé
        token.role = currentUser.role
        token.plan = currentUser.plan
        token.planExpiresAt = currentUser.planExpiresAt
        token.teamId = currentUser.teamId
        token.teamRole = currentUser.teamRole
      }
      return token
    },
    session: async ({ session, token }) => {
      if (!token) {
        // Si le token est null, la session a été invalidée
        return null
      }
      
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
        session.user.planExpiresAt = token.planExpiresAt as Date | null
        session.user.teamId = token.teamId as string | null
        session.user.teamRole = token.teamRole as string | null
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}