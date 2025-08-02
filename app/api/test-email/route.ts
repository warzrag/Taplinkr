import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST() {
  try {
    // Email de test - Remplacez par votre email
    const testEmail = 'test@example.com'
    const testName = 'Test User'

    // Envoyer email de bienvenue
    const welcomeResult = await EmailService.sendWelcomeEmail(testEmail, testName)
    
    if (!welcomeResult.success) {
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'envoi de l\'email de bienvenue',
          details: welcomeResult.error 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email de test envoyé avec succès!',
      result: welcomeResult.data
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error.message 
      },
      { status: 500 }
    )
  }
}