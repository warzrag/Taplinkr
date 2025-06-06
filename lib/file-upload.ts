import { promises as fs } from 'fs'
import path from 'path'
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
  private uploadDir = path.join(process.cwd(), 'public/uploads')

  constructor() {
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }

  async uploadFile(file: File, userId: string): Promise<UploadResult> {
    const fileId = nanoid()
    const extension = this.getFileExtension(file.name)
    const filename = `${fileId}${extension}`
    const filePath = path.join(this.uploadDir, filename)
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Optimize image if it's an image
    let finalBuffer = buffer
    if (this.isImage(file.type)) {
      finalBuffer = await this.optimizeImage(buffer)
    }
    
    // Write file
    await fs.writeFile(filePath, finalBuffer)
    
    return {
      id: fileId,
      filename,
      originalName: file.name,
      url: `/uploads/${filename}`,
      mimeType: file.type,
      size: finalBuffer.length
    }
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer()
    } catch (error) {
      console.error('Error optimizing image:', error)
      return buffer
    }
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase()
  }

  async generateThumbnail(imageBuffer: Buffer, size: number = 200): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' }
    }

    return { valid: true }
  }
}

export const fileUploadService = new FileUploadService()