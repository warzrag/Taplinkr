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

interface ResetPasswordEmailProps {
  userName?: string
  resetUrl: string
}

export const ResetPasswordEmail = ({
  userName = 'là',
  resetUrl,
}: ResetPasswordEmailProps) => {
  const previewText = `Réinitialisez votre mot de passe TapLinkr`

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
          
          <Heading style={h1}>Réinitialisation du mot de passe</Heading>
          
          <Text style={text}>
            Salut {userName},
          </Text>
          
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de votre mot de passe.
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={resetUrl}
            >
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          <Text style={text}>
            Ou copiez et collez ce lien dans votre navigateur :
          </Text>
          
          <Text style={linkText}>
            {resetUrl}
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            Ce lien expirera dans 1 heure pour des raisons de sécurité.
          </Text>

          <Text style={text}>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer
            cet email. Votre mot de passe ne sera pas modifié.
          </Text>

          <Text style={footer}>
            Pour protéger votre compte, nous vous recommandons d'utiliser un mot de passe
            fort et unique pour TapLinkr.
          </Text>

          <Text style={footer}>
            Des questions ? Contactez-nous à{' '}
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

export default ResetPasswordEmail

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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
}

const linkText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
  wordBreak: 'break-all' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '27px 0',
}

const button = {
  backgroundColor: '#dc2626',
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