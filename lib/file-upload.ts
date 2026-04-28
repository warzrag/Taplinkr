import { nanoid } from 'nanoid'
import { getDefaultBucket } from '@/lib/firebase-admin'

export interface UploadResult {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
}

export class FileUploadService {
  async uploadFile(file: File, userId: string): Promise<UploadResult> {
    const fileId = nanoid()
    const extension = this.getFileExtension(file.name, file.type)
    const filename = `uploads/${userId}/files/${fileId}${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const token = nanoid(32)
    const bucket = getDefaultBucket()

    await bucket.file(filename).save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: {
          firebaseStorageDownloadTokens: token,
          ownerId: userId,
          originalName: file.name,
        },
      },
    })

    return {
      id: fileId,
      filename,
      originalName: file.name,
      url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media&token=${token}`,
      mimeType: file.type,
      size: buffer.length,
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const bucket = getDefaultBucket()
    const [files] = await bucket.getFiles({ prefix: `uploads/${userId}/files/${fileId}` })
    await Promise.all(files.map(file => file.delete().catch(() => undefined)))
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' }
    }

    return { valid: true }
  }

  private getFileExtension(filename: string, mimeType: string): string {
    const ext = filename.match(/\.[a-z0-9]+$/i)?.[0]
    if (ext) return ext.toLowerCase()
    if (mimeType === 'image/jpeg') return '.jpg'
    if (mimeType === 'image/png') return '.png'
    if (mimeType === 'image/gif') return '.gif'
    if (mimeType === 'image/webp') return '.webp'
    if (mimeType === 'image/svg+xml') return '.svg'
    return '.bin'
  }
}

export const fileUploadService = new FileUploadService()
