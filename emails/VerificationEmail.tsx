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

interface VerificationEmailProps {
  userName?: string
  verificationUrl: string
}

export const VerificationEmail = ({
  userName = 'there',
  verificationUrl,
}: VerificationEmailProps) => {
  const previewText = `Verify your email address for TapLinkr`

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
          
          <Heading style={h1}>Verify your email address</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            To finish setting up your TapLinkr account, we need to verify your email
            address. Click the button below to confirm it.
          </Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={verificationUrl}
            >
              Verify my email
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this link into your browser:
          </Text>
          
          <Text style={linkText}>
            {verificationUrl}
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            This link expires in 24 hours. If you did not create a TapLinkr account,
            you can safely ignore this email.
          </Text>

          <Text style={footer}>
            Questions? Contact us at{' '}
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

export default VerificationEmail

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
