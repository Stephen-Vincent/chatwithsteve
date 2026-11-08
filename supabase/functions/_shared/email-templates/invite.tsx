/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join Chat with Steve</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a href="https://chatwithsteve.co.uk"><Img src={LOGO_URL} alt="ChatWithSteve" width="180" style={{ width: '180px', height: 'auto', margin: '0 auto' }} /></a>
        </div>
        <Heading style={h1}>You've been invited! 🎉</Heading>
        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>Chat with Steve</strong>
          </Link>
          . Click the button below to accept the invitation and create your
          account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email.
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

export default InviteEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(222, 47%, 11%)',
  color: 'hsl(210, 40%, 98%)',
  fontSize: '14px',
  borderRadius: '10px',
  padding: '12px 24px',
  textDecoration: 'none',
  fontWeight: '600' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const brand = { fontSize: '12px', color: 'hsl(215, 16%, 47%)', margin: '30px 0 0', borderTop: '1px solid hsl(214, 20%, 88%)', paddingTop: '20px' }
const brandLink = { color: 'hsl(38, 92%, 50%)', textDecoration: 'none' }
