import nodemailer from 'nodemailer'

// Configuration du transporteur email
// Pour la production, utilise un vrai service comme SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  // Pour le développement, on utilise Ethereal Email (fake SMTP)
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'ethereal.user',
    pass: process.env.EMAIL_PASS || 'ethereal.pass'
  }
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"LinkTracker" <noreply@linktracker.com>',
      to,
      subject,
      html
    })

    console.log('Email envoyé:', info.messageId)
    
    // En développement avec Ethereal, on peut voir l'email ici:
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

export function getVerificationEmailTemplate(username: string, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification de votre compte LinkTracker</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px;">LinkTracker</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Vérification de votre compte</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0;">Bonjour ${username} ! 👋</h2>
                  
                  <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                    Merci de vous être inscrit sur LinkTracker ! Pour activer votre compte et commencer à créer vos liens personnalisés, veuillez confirmer votre adresse email.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;">
                      Vérifier mon email
                    </a>
                  </div>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                    Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                    <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                  </p>
                  
                  <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 30px 0;">
                    <p style="color: #666666; margin: 0; font-size: 14px;">
                      <strong>⏰ Important :</strong> Ce lien expire dans 24 heures. Après ce délai, vous devrez demander un nouveau lien de vérification.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                    Vous n'avez pas créé de compte ? Ignorez cet email.
                  </p>
                  <p style="color: #999999; margin: 0; font-size: 14px;">
                    © 2024 LinkTracker. Tous droits réservés.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}