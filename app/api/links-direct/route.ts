import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route simplifiée qui utilise Prisma
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log(`✅ API Links Direct: ${links.length} liens trouvés`)
    return NextResponse.json(links)
    
  } catch (error) {
    console.error('❌ Erreur API Links Direct:', error)
    return NextResponse.json([])
  }
}