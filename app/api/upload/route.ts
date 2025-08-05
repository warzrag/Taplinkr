import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Upload session:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'avatar', 'banner', 'cover', 'profile'
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Optimiser l'image selon le type
    let optimizedBuffer = buffer
    
    try {
      const image = sharp(buffer)
      const metadata = await image.metadata()

      // Configurations selon le type
      switch (type) {
        case 'avatar':
          // Photo de profil : carré 400x400
          optimizedBuffer = await image
            .resize(400, 400, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toBuffer()
          break
          
        case 'banner':
          // Bannière : 1200x300
          optimizedBuffer = await image
            .resize(1200, 300, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toBuffer()
          break
          
        case 'cover':
          // Couverture de lien : 800x600
          optimizedBuffer = await image
            .resize(800, 600, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toBuffer()
          break
          
        case 'profile':
          // Photo de profil de lien : carré 300x300
          optimizedBuffer = await image
            .resize(300, 300, { 
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toBuffer()
          break
          
        default:
          // Par défaut, limiter la taille max à 1920px
          if (metadata.width && metadata.width > 1920) {
            optimizedBuffer = await image
              .resize(1920, null, { 
                withoutEnlargement: true 
              })
              .jpeg({ quality: 85 })
              .toBuffer()
          }
      }
    } catch (error) {
      console.log('Erreur optimisation image:', error)
      // Si l'optimisation échoue, utiliser l'image originale
    }

    // Convertir en base64 pour stockage direct
    const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`
    
    // Pour une solution temporaire, on retourne directement l'image en base64
    // Dans un cas réel, vous devriez utiliser un service comme Cloudinary, AWS S3, etc.
    return NextResponse.json({
      url: base64Image,
      filename: file.name
    })

  } catch (error) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}