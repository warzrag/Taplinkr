import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier les variables d'environnement (sans exposer les valeurs complètes)
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_START: process.env.DATABASE_URL?.substring(0, 30) + '...',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    // Tester la connexion à la base de données
    let dbStatus = 'Not tested';
    let userCount = 0;
    let adminExists = false;
    
    try {
      userCount = await prisma.user.count();
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@taplinkr.com' }
      });
      adminExists = !!admin;
      dbStatus = 'Connected';
    } catch (error: any) {
      dbStatus = `Error: ${error.message}`;
    }
    
    return NextResponse.json({
      status: 'Debug endpoint',
      environment: envCheck,
      database: {
        status: dbStatus,
        userCount,
        adminAccountExists: adminExists
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}