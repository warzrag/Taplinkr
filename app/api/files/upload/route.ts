import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileUploadService } from '@/lib/file-upload'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const validation = fileUploadService.validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const uploadedFile = await fileUploadService.uploadFile(file, session.user.id)
    return NextResponse.json(uploadedFile)
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({
      error: 'Erreur lors de l upload',
      details: error?.message,
    }, { status: 500 })
  }
}
