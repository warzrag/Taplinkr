import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function GET() {
  try {
    // Configuration check
    const hasApiKey = !!process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || 'not configured'
    
    return NextResponse.json({
      resendConfigured: hasApiKey,
      emailFrom: emailFrom,
      apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Email de test
    const testEmail = email || 'florent.media2@gmail.com'
    const testName = 'Florent'

    console.log('Tentative d\'envoi d\'email à:', testEmail)

    // Envoyer email de bienvenue
    const welcomeResult = await EmailService.sendWelcomeEmail(testEmail, testName)
    
    console.log('Résultat:', welcomeResult)
    
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
      result: welcomeResult.data,
      sentTo: testEmail
    })
  } catch (error: any) {
    console.error('Erreur test email:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error.message 
      },
      { status: 500 }
    )
  }
}