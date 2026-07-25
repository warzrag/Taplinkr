import { LegalPage } from '@/components/marketing/LegalPage'

export const metadata = { title: 'Cookies' }

export default function CookiesPage() {
  return <LegalPage title="Cookies and local storage" intro="TapLinkr uses mechanisms strictly necessary for login, security, and interface preferences."><h2>Essential cookies</h2><p>Session cookies authenticate you, keep you signed in, and protect requests. They are required for account functionality and are not used to build an advertising profile.</p><h2>Technical preferences</h2><p>Your browser may store preferences such as light or dark mode so you do not have to choose them on every visit.</p><h2>Analytics</h2><p>Creator analytics cover the use of their pages and links. They are limited to information useful for the service and abuse prevention. TapLinkr does not display behavioral advertising.</p><h2>Your settings</h2><p>You can delete or block cookies in your browser settings. Blocking essential cookies will prevent login and some secure features from working.</p><h2>Contact</h2><p>Questions about these mechanisms? Email <a href="mailto:hello@taplinkr.com">hello@taplinkr.com</a>.</p></LegalPage>
}
