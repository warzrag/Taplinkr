import { LegalPage } from '@/components/marketing/LegalPage'

export const metadata = { title: 'Cookies' }

export default function CookiesPage() {
  return <LegalPage title="Cookies et stockage local" intro="TapLinkr utilise les mécanismes strictement nécessaires à la connexion, à la sécurité et aux préférences de l’interface."><h2>Cookies essentiels</h2><p>Des cookies de session sont utilisés pour vous authentifier, maintenir votre connexion et protéger les requêtes. Ils sont indispensables au fonctionnement du compte et ne servent pas à créer un profil publicitaire.</p><h2>Préférences techniques</h2><p>Le navigateur peut conserver certaines préférences, comme le thème clair ou sombre, afin d’éviter de vous les redemander à chaque visite.</p><h2>Statistiques</h2><p>Les statistiques proposées aux créateurs portent sur l’utilisation de leurs pages et de leurs liens. Elles sont conçues pour rester limitées aux informations utiles au service et à la prévention des abus. TapLinkr n’affiche pas de publicité comportementale.</p><h2>Vos réglages</h2><p>Vous pouvez supprimer ou bloquer les cookies depuis les paramètres de votre navigateur. Le blocage des cookies essentiels empêchera toutefois la connexion et certaines fonctions sécurisées.</p><h2>Contact</h2><p>Une question sur ces mécanismes ? Écrivez à <a href="mailto:hello@taplinkr.com">hello@taplinkr.com</a>.</p></LegalPage>
}
