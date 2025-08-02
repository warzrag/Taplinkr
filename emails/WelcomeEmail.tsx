import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userName?: string
  userEmail: string
}

export const WelcomeEmail = ({
  userName = 'là',
  userEmail,
}: WelcomeEmailProps) => {
  const previewText = `Bienvenue sur TapLinkr, ${userName}!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://www.taplinkr.com/logo.png"
              width="120"
              height="40"
              alt="TapLinkr"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Bienvenue sur TapLinkr ! 🎉</Heading>
          
          <Text style={text}>
            Salut {userName},
          </Text>
          
          <Text style={text}>
            Merci de rejoindre TapLinkr ! Nous sommes ravis de vous avoir parmi nous.
          </Text>

          <Text style={text}>
            Avec TapLinkr, vous pouvez créer votre page bio personnalisée en quelques minutes
            et partager tous vos liens importants en un seul endroit.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href="https://www.taplinkr.com/dashboard"
            >
              Accéder à mon dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Pour bien démarrer :</Heading>
          
          <Text style={text}>
            <strong>1. Personnalisez votre profil</strong><br />
            Ajoutez votre photo, votre bio et choisissez votre thème
          </Text>
          
          <Text style={text}>
            <strong>2. Ajoutez vos liens</strong><br />
            Connectez tous vos réseaux sociaux et sites web
          </Text>
          
          <Text style={text}>
            <strong>3. Partagez votre page</strong><br />
            Votre lien unique : <Link href={`https://www.taplinkr.com/${userEmail.split('@')[0]}`} style={link}>
              taplinkr.com/{userEmail.split('@')[0]}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Des questions ? Répondez simplement à cet email ou contactez-nous à{' '}
            <Link href="mailto:support@taplinkr.com" style={link}>
              support@taplinkr.com
            </Link>
          </Text>

          <Text style={footer}>
            TapLinkr - One tap, tout accessible
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
}

const logoContainer = {
  textAlign: 'center' as const,
  padding: '32px 20px',
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
}

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '30px 0 15px',
  padding: '0 48px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '27px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 48px',
  textAlign: 'center' as const,
}