import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { authOptions } from '@/lib/auth'
import { getDefaultBucket } from '@/lib/firebase-admin'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const IMAGE_TYPES = new Set(['avatar', 'banner', 'cover', 'icon', 'profile'])

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
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    let uploaded = { buffer: rawBuffer, contentType: file.type }

    try {
      uploaded = await optimizeImage(rawBuffer, type, file.type)
    } catch (error) {
      console.warn('Image optimization skipped:', error)
    }

    const bucket = getDefaultBucket()
    const token = nanoid(32)
    const fileId = nanoid()
    const extension = extensionFor(uploaded.contentType, file.name)
    const storagePath = `uploads/${session.user.id}/${type}/${fileId}${extension}`

    await bucket.file(storagePath).save(uploaded.buffer, {
      resumable: false,
      metadata: {
        contentType: uploaded.contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: {
          firebaseStorageDownloadTokens: token,
          ownerId: session.user.id,
          originalName: file.name,
          uploadType: type,
        },
      },
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`

    return NextResponse.json({
      id: fileId,
      url,
      filename: storagePath,
      path: storagePath,
      originalName: file.name,
      mimeType: uploaded.contentType,
      size: uploaded.buffer.length,
    })
  } catch (error: any) {
    console.error('Erreur upload:', error)
    const message = error?.code === 404 || error?.message?.includes('No such object')
      ? 'Firebase Storage bucket introuvable. Active Firebase Storage puis renseigne FIREBASE_STORAGE_BUCKET si besoin.'
      : 'Erreur lors de l upload'
    return NextResponse.json({ error: message, details: error?.message }, { status: 500 })
  }
}
