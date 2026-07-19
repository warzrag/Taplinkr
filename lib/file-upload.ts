import { nanoid } from 'nanoid'
import sharp from 'sharp'

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
    const { put } = await import('@vercel/blob')
    const fileId = nanoid()
    const extension = this.getFileExtension(file.name, file.type)
    const filename = `uploads/${userId}/files/${fileId}${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata()
    const allowedFormats = new Set(['jpeg', 'png', 'gif', 'webp'])
    if (!metadata.format || !allowedFormats.has(metadata.format) || !metadata.width || !metadata.height) {
      throw new Error('Invalid image content')
    }

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      cacheControlMaxAge: 31536000,
      allowOverwrite: false,
    })

    return {
      id: fileId,
      filename: blob.pathname,
      originalName: file.name,
      url: blob.url,
      mimeType: file.type,
      size: buffer.length,
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const { del, list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: `uploads/${userId}/files/${fileId}` })
    await Promise.all(blobs.map(blob => del(blob.url).catch(() => undefined)))
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 4 * 1024 * 1024
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 4MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' }
    }

    return { valid: true }
  }

  private getFileExtension(filename: string, mimeType: string): string {
    if (mimeType === 'image/jpeg') return '.jpg'
    if (mimeType === 'image/png') return '.png'
    if (mimeType === 'image/gif') return '.gif'
    if (mimeType === 'image/webp') return '.webp'
    return '.bin'
  }
}

export const fileUploadService = new FileUploadService()
