import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD API START ===')
  try {
    console.log('1. Getting session...')
    const session = await getServerSession(authOptions)
    console.log('Session user ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('ERROR: No session or user ID')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('2. Getting form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    console.log('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })
    
    if (!file) {
      console.log('ERROR: No file provided')
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    console.log('3. Validating file...')
    if (!file.type.startsWith('image/')) {
      console.log('ERROR: Invalid file type:', file.type)
      return NextResponse.json({ error: 'Seules les images sont autorisées' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log('ERROR: File too large:', file.size)
      return NextResponse.json({ error: 'Le fichier doit faire moins de 5MB' }, { status: 400 })
    }

    console.log('4. Generating filename...')
    const fileId = nanoid()
    const extension = path.extname(file.name).toLowerCase()
    const filename = `${fileId}${extension}`
    console.log('Generated filename:', filename)
    
    console.log('5. Checking upload directory...')
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    console.log('Upload directory:', uploadDir)
    
    try {
      await fs.access(uploadDir)
      console.log('Upload directory exists')
    } catch {
      console.log('Creating upload directory...')
      await fs.mkdir(uploadDir, { recursive: true })
      console.log('Upload directory created')
    }

    console.log('6. Saving file...')
    const filePath = path.join(uploadDir, filename)
    console.log('File path:', filePath)
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength)
    
    const buffer = Buffer.from(arrayBuffer)
    console.log('Buffer created, size:', buffer.length)
    
    await fs.writeFile(filePath, buffer)
    console.log('File written successfully')

    const url = `/uploads/${filename}`
    console.log('7. File URL:', url)

    // Skip database save for now to test
    console.log('8. Skipping database save for testing...')
    
    console.log('=== UPLOAD SUCCESS ===')
    return NextResponse.json({ url, id: fileId }, { status: 201 })
  } catch (error) {
    console.error('=== UPLOAD ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      error: `Erreur serveur: ${error.message}` 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const files = await prisma.file.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}