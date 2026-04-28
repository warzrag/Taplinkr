import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { put } from '@vercel/blob'
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

async function optimizeImage(buffer: Buffer, type: string, mimeType: string) {
  if (mimeType === 'image/gif') {
    return { buffer, contentType: mimeType }
  }

  const image = sharp(buffer)
  const metadata = await image.metadata()

  switch (type) {
    case 'avatar':
      return {
        buffer: await image.resize(400, 400, { fit: 'cover', position: 'center' }).jpeg({ quality: 85 }).toBuffer(),
        contentType: 'image/jpeg',
      }
    case 'banner':
      return {
        buffer: await image.resize(1200, 300, { fit: 'cover', position: 'center' }).jpeg({ quality: 85 }).toBuffer(),
        contentType: 'image/jpeg',
      }
    case 'cover':
      return {
        buffer: await image.resize(800, 600, { fit: 'cover', position: 'center' }).jpeg({ quality: 85 }).toBuffer(),
        contentType: 'image/jpeg',
      }
    case 'icon':
      return {
        buffer: await image.resize(64, 64, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer(),
        contentType: 'image/jpeg',
      }
    case 'profile':
      return {
        buffer: await image.resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
        contentType: 'image/jpeg',
      }
    default:
      if (metadata.width && metadata.width > 1920) {
        return {
          buffer: await image.resize(1920, null, { withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
          contentType: 'image/jpeg',
        }
      }
      return { buffer, contentType: mimeType }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestedType = String(formData.get('type') || 'image')
    const type = IMAGE_TYPES.has(requestedType) ? requestedType : 'image'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorise' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 4MB)' }, { status: 400 })
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    let uploaded = { buffer: rawBuffer, contentType: file.type }

    try {
      uploaded = await optimizeImage(rawBuffer, type, file.type)
    } catch (error) {
      console.warn('Image optimization skipped:', error)
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
      : 'Erreur lors de l upload'
    return NextResponse.json({ error: message, details: error?.message }, { status: 500 })
  }
}
