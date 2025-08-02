import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY non définie - Les emails ne seront pas envoyés')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export const emailConfig = {
  from: process.env.EMAIL_FROM || 'TapLinkr <onboarding@resend.dev>',
  replyTo: 'support@taplinkr.com'
}