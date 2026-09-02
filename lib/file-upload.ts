import { enregistrerMedia, supprimerMediasParPrefixe } from '@/lib/media-storage'
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
    const fileId = nanoid()
    const extension = this.getFileExtension(file.name, file.type)
    const filename = `uploads/${userId}/files/${fileId}${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata()
    const allowedFormats = new Set(['jpeg', 'png', 'gif', 'webp'])
    if (!metadata.format || !allowedFormats.has(metadata.format) || !metadata.width || !metadata.height) {
      throw new Error('Invalid image content')
    }

    // Ecrit sur le disque du serveur plutot que chez Vercel Blob, dont le
    // compte est impaye et les fichiers susceptibles de disparaitre.
    const media = await enregistrerMedia(filename, buffer)

    return {
      id: fileId,
      filename: media.chemin,
      originalName: file.name,
      url: media.url,
      mimeType: file.type,
      size: buffer.length,
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    await supprimerMediasParPrefixe(`uploads/${userId}/files/${fileId}`)
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
