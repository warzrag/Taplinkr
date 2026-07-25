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
  userName = 'there',
  userEmail,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to TapLinkr, ${userName}!`

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
          
          <Heading style={h1}>Welcome to TapLinkr! 🎉</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            Thanks for joining TapLinkr! We're excited to have you here.
          </Text>

          <Text style={text}>
            With TapLinkr, you can create a custom bio page in minutes
            and share all your important links in one place.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href="https://www.taplinkr.com/dashboard"
            >
              Go to my dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading style={h2}>Get started:</Heading>
          
          <Text style={text}>
            <strong>1. Customize your profile</strong><br />
            Add your photo and bio, then choose your theme
          </Text>
          
          <Text style={text}>
            <strong>2. Add your links</strong><br />
            Connect your social profiles and websites
          </Text>
          
          <Text style={text}>
            <strong>3. Share your page</strong><br />
            Your unique link: <Link href={`https://www.taplinkr.com/${userEmail.split('@')[0]}`} style={link}>
              taplinkr.com/{userEmail.split('@')[0]}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Reply to this email or contact us at{' '}
            <Link href="mailto:support@taplinkr.com" style={link}>
              support@taplinkr.com
            </Link>
          </Text>

          <Text style={footer}>
            TapLinkr — One tap, everything accessible
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
