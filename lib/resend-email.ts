import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmailWithResend({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'TapLinkr <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Erreur Resend:', error)
      return { success: false, error }
    }

    console.log('Email envoyé via Resend:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

// Fonction de compatibilité avec l'ancienne interface
export async function sendEmail(options: SendEmailOptions) {
  return sendEmailWithResend(options)
}