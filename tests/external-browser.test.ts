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

  it('detects the current X iOS browser from its t.co referer', () => {
    const disguisedTwitterBrowser = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'

    expect(isInAppBrowser(disguisedTwitterBrowser, 'https://t.co/')).toBe(true)
    expect(isInAppBrowser(disguisedTwitterBrowser, 'direct')).toBe(false)
  })

  it('does not treat Twitter preview bots as in-app browsers', () => {
    expect(isInAppBrowser('Twitterbot/1.0', 'https://t.co/')).toBe(false)
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
