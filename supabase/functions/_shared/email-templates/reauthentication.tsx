/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

const LOGO_URL = 'https://chatwithsteve.co.uk/chatwithsteve-logo-bw.png'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a href="https://chatwithsteve.co.uk"><Img src={LOGO_URL} alt="ChatWithSteve" width="180" style={{ width: '180px', height: 'auto', margin: '0 auto' }} /></a>
        </div>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
        <Text style={brand}>
          Chat with Steve ·{' '}
          <Link href="https://chatwithsteve.co.uk" style={brandLink}>
            chatwithsteve.co.uk
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '26px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(215, 16%, 47%)',
  lineHeight: '1.6',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: 'hsl(222, 47%, 11%)',
  margin: '0 0 30px',
  letterSpacing: '4px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const brand = { fontSize: '12px', color: 'hsl(215, 16%, 47%)', margin: '30px 0 0', borderTop: '1px solid hsl(214, 20%, 88%)', paddingTop: '20px' }
const brandLink = { color: 'hsl(38, 92%, 50%)', textDecoration: 'none' }
