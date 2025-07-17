import nodemailer from 'nodemailer'
import { sendEmail, getVerificationEmailTemplate } from '../lib/email'

async function createTestAccount() {
  // Créer un compte de test Ethereal
  const testAccount = await nodemailer.createTestAccount()
  
  console.log('🔧 Configuration email de test:')
  console.log('EMAIL_HOST=', testAccount.smtp.host)
  console.log('EMAIL_PORT=', testAccount.smtp.port)
  console.log('EMAIL_USER=', testAccount.user)
  console.log('EMAIL_PASS=', testAccount.pass)
  console.log('\n')

  // Créer un transporteur avec les credentials de test
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })

  // Envoyer un email de test
  const verificationUrl = 'http://localhost:3000/auth/verify-email?token=test-token-123'
  const html = getVerificationEmailTemplate('Florent', verificationUrl)

  const info = await transporter.sendMail({
    from: '"LinkTracker" <noreply@linktracker.com>',
    to: 'florentivo95270@gmail.com',
    subject: 'Test - Vérifiez votre compte LinkTracker',
    html
  })

  console.log('✅ Email envoyé!')
  console.log('Message ID:', info.messageId)
  console.log('\n🔗 Voir l\'email ici:')
  console.log(nodemailer.getTestMessageUrl(info))
}

createTestAccount().catch(console.error)