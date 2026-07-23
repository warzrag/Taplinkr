import { describe, expect, it } from 'vitest'

import {
  getExternalBrowserUrl,
  getMobilePlatform,
  isInAppBrowser,
} from '../lib/external-browser'

describe('external browser redirects', () => {
  it.each([
    'Mozilla/5.0 Instagram 320.0.0 iPhone',
    'Mozilla/5.0 Twitter for iPhone',
    'Mozilla/5.0 TwitterAndroid',
    'Mozilla/5.0 FBAN/FBIOS',
  ])('detects an in-app browser from %s', (userAgent) => {
    expect(isInAppBrowser(userAgent)).toBe(true)
  })

  it('does not intercept Safari or Chrome', () => {
    expect(isInAppBrowser('Mozilla/5.0 iPhone Version/18.0 Mobile Safari/604.1')).toBe(false)
    expect(isInAppBrowser('Mozilla/5.0 Linux; Android 15 Chrome/136 Mobile Safari/537.36')).toBe(false)
  })

  it('builds the historical Safari URL scheme on iOS', () => {
    expect(getMobilePlatform('Mozilla/5.0 (iPhone) Instagram')).toBe('ios')
    expect(getExternalBrowserUrl('https://www.taplinkr.com/creator?ref=x', 'ios'))
      .toBe('x-safari-https://www.taplinkr.com/creator?ref=x')
  })

  it('builds an Android browser intent', () => {
    expect(getMobilePlatform('Mozilla/5.0 (Linux; Android 15) TwitterAndroid')).toBe('android')
    expect(getExternalBrowserUrl('https://www.taplinkr.com/creator?ref=x', 'android'))
      .toBe('intent://www.taplinkr.com/creator?ref=x#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end')
  })
})
