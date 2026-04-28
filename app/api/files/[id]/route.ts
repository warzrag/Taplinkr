import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fileUploadService } from '@/lib/file-upload'

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    await fileUploadService.deleteFile(params.id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('File delete error:', error)
    return NextResponse.json({
      error: 'Erreur lors de la suppression',
      details: error?.message,
    }, { status: 500 })
  }
}
