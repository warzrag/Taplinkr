import { nanoid } from 'nanoid'
import { del, list, put } from '@vercel/blob'

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
    const ext = filename.match(/\.[a-z0-9]+$/i)?.[0]
    if (ext) return ext.toLowerCase()
    if (mimeType === 'image/jpeg') return '.jpg'
    if (mimeType === 'image/png') return '.png'
    if (mimeType === 'image/gif') return '.gif'
    if (mimeType === 'image/webp') return '.webp'
    return '.bin'
  }
}

export const fileUploadService = new FileUploadService()
