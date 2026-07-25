import { resend, emailConfig } from './resend'
import WelcomeEmail from '@/emails/WelcomeEmail'
import VerificationEmail from '@/emails/VerificationEmail'
import ResetPasswordEmail from '@/emails/ResetPasswordEmail'

export class EmailService {
  private static getAppUrl() {
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL
    if (!appUrl) throw new Error('APP_URL or NEXTAUTH_URL is required')
    return appUrl.replace(/\/$/, '')
  }

  static async sendWelcomeEmail(to: string, userName: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: `Welcome to TapLinkr, ${userName}! 🎉`,
        react: WelcomeEmail({ userName, userEmail: to }),
      })

      if (error) {
        console.error('Erreur envoi email de bienvenue:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erreur envoi email de bienvenue:', error)
      return { success: false, error }
    }
  }

  static async sendVerificationEmail(to: string, userName: string, token: string) {
    try {
      const verificationUrl = `${this.getAppUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`
      
      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: 'Verify your email address - TapLinkr',
        react: VerificationEmail({ userName, verificationUrl }),
      })

      if (error) {
        console.error('Erreur envoi email de vérification:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erreur envoi email de vérification:', error)
      return { success: false, error }
    }
  }

  static async sendPasswordResetEmail(to: string, userName: string, token: string) {
    try {
      const resetUrl = `${this.getAppUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`
      
      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: 'Reset your password - TapLinkr',
        react: ResetPasswordEmail({ userName, resetUrl }),
      })

      if (error) {
        console.error('Erreur envoi email de réinitialisation:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erreur envoi email de réinitialisation:', error)
      return { success: false, error }
    }
  }

  static async sendTeamInviteEmail(to: string, inviterName: string, teamName: string, inviteUrl: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: emailConfig.from,
        to,
        subject: `${inviterName} invited you to join ${teamName} on TapLinkr`,
        html: `
          <h2>You're invited to join a team</h2>
          <p>${inviterName} invited you to join the "${teamName}" team on TapLinkr.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Accept invitation
          </a>
          <p>Or copy this link: ${inviteUrl}</p>
        `,
      })

      if (error) {
        console.error('Erreur envoi email d\'invitation:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erreur envoi email d\'invitation:', error)
      return { success: false, error }
    }
  }
}
