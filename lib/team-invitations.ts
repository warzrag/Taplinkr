import { sendEmail } from './resend-email'

export type TeamInviteRole = 'admin' | 'member' | 'viewer'

export function normalizeTeamInviteEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function buildTeamInviteUrl(token: string, baseUrl = process.env.NEXTAUTH_URL): string {
  const origin = (baseUrl || 'https://www.taplinkr.com').replace(/\/+$/, '')
  return `${origin}/teams/join/${encodeURIComponent(token)}`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function roleLabel(role: TeamInviteRole): string {
  return {
    admin: 'Administrateur',
    member: 'Membre',
    viewer: 'Observateur',
  }[role]
}

export async function sendTeamInvitationEmail(input: {
  email: string
  inviter: string
  teamName: string
  role: TeamInviteRole
  token: string
}) {
  const inviteUrl = buildTeamInviteUrl(input.token)
  const email = escapeHtml(input.email)
  const inviter = escapeHtml(input.inviter)
  const teamName = escapeHtml(input.teamName)

  const result = await sendEmail({
    to: input.email,
    subject: `Invitation à rejoindre l'équipe ${input.teamName} sur TapLinkr`,
    html: `
      <!doctype html>
      <html lang="fr">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;background:#f5f3ff;font-family:Arial,sans-serif;color:#18181b">
          <div style="max-width:560px;margin:0 auto;padding:32px 16px">
            <div style="background:#fff;border:1px solid #e4e4e7;border-radius:20px;padding:32px">
              <div style="font-size:22px;font-weight:800;color:#7c3aed">TapLinkr</div>
              <h1 style="margin:28px 0 12px;font-size:26px">Rejoignez ${teamName}</h1>
              <p style="line-height:1.65;color:#52525b">
                ${inviter} vous invite en tant que <strong>${roleLabel(input.role)}</strong>.
              </p>
              <a href="${inviteUrl}" style="display:block;margin:28px 0;padding:15px 20px;border-radius:12px;background:#7c3aed;color:#fff;text-align:center;text-decoration:none;font-weight:700">
                Accepter l’invitation
              </a>
              <p style="font-size:13px;line-height:1.55;color:#71717a">
                Cette invitation est réservée à ${email} et expire dans 7 jours.
              </p>
              <p style="font-size:12px;line-height:1.55;color:#a1a1aa;word-break:break-all">${inviteUrl}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })

  return { ...result, inviteUrl }
}
