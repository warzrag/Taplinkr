import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nanoid } from 'nanoid'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const IMAGE_TYPES = new Set(['avatar', 'banner', 'cover', 'icon', 'profile'])

export const runtime = 'nodejs'

function extensionFor(contentType: string, originalName: string) {
  if (contentType === 'image/jpeg' || contentType === 'image/jpg') return '.jpg'
  if (contentType === 'image/png') return '.png'
  if (contentType === 'image/gif') return '.gif'
  if (contentType === 'image/webp') return '.webp'
  const ext = originalName.match(/\.[a-z0-9]+$/i)?.[0]
  return ext?.toLowerCase() || '.bin'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { put } = await import('@vercel/blob')

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestedType = String(formData.get('type') || 'image')
    const type = IMAGE_TYPES.has(requestedType) ? requestedType : 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorise' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 4 MB)' }, { status: 400 })
    }

    // Keep uploads as their original bytes. The previous server-side Sharp
    // conversion could not resolve its native binary in the production
    // function and rejected otherwise valid landing-page images.
    const uploaded = {
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    }

    const fileId = nanoid()
    const extension = extensionFor(uploaded.contentType, file.name)
    const pathname = `uploads/${session.user.id}/${type}/${fileId}${extension}`

    const blob = await put(pathname, uploaded.buffer, {
      access: 'public',
      contentType: uploaded.contentType,
      cacheControlMaxAge: 31536000,
      allowOverwrite: false,
    })

    return NextResponse.json({
      id: fileId,
      url: blob.url,
      filename: blob.pathname,
      path: blob.pathname,
      originalName: file.name,
      mimeType: uploaded.contentType,
      size: uploaded.buffer.length,
    })
  } catch (error: any) {
    console.error('Erreur upload:', error)
    const message = error?.message?.includes('BLOB_READ_WRITE_TOKEN')
      ? 'Vercel Blob n\'est pas configure. Verifie BLOB_READ_WRITE_TOKEN dans Vercel.'
      : 'Unable to upload the file'
    return NextResponse.json({ error: message, details: error?.message }, { status: 500 })
  }
}
