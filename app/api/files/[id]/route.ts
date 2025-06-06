import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fileUploadService } from '@/lib/file-upload'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const file = await prisma.file.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    // Delete file from filesystem
    await fileUploadService.deleteFile(file.filename)
    
    // Delete from database
    await prisma.file.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const file = await prisma.file.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 })
    }

    return NextResponse.json(file)
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}