import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Test auth attempt for:', email);
    
    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: {
          emailSearched: email,
          userFound: false
        }
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      success: isPasswordValid,
      debug: {
        userFound: true,
        userEmail: user.email,
        userRole: user.role,
        emailVerified: user.emailVerified,
        passwordValid: isPasswordValid,
        passwordHash: user.password.substring(0, 20) + '...',
        environment: {
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
          DATABASE_URL: !!process.env.DATABASE_URL,
          NODE_ENV: process.env.NODE_ENV
        }
      }
    });
    
  } catch (error: any) {
    console.error('Test auth error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Lister les comptes admin disponibles
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        email: true,
        username: true,
        emailVerified: true
      }
    });
    
    return NextResponse.json({
      message: 'POST to this endpoint with {email, password} to test authentication',
      adminAccounts: admins,
      testCredentials: [
        { email: 'admin@taplinkr.com', password: 'Admin123!' },
        { email: 'florentivo95270@gmail.com', password: 'Admin123!' }
      ],
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabase: !!process.env.DATABASE_URL
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}