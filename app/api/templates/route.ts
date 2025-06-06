import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { templateEngine } from '@/lib/template-engine'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    
    const templates = await templateEngine.getTemplates(category)
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const templateConfig = await request.json()
    
    const template = await templateEngine.createTemplate(
      session.user.id,
      templateConfig,
      false // User templates are not premium by default
    )
    
    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du template:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}