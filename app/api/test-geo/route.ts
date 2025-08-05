import { NextResponse } from 'next/server'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function GET(request: Request) {
  try {
    // Récupérer l'IP du visiteur
    const forwarded = request.headers.get('x-forwarded-for')
    const real = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0].trim() || real || '8.8.8.8'
    
    console.log('Test Geo - Headers:', {
      forwarded,
      real,
      ip
    })
    
    // Tester avec une IP connue
    const testIp = '8.8.8.8'
    console.log('Test avec IP Google:', testIp)
    const testLocation = await getLocationFromIP(testIp)
    
    // Tester avec l'IP réelle
    console.log('Test avec IP réelle:', ip)
    const realLocation = await getLocationFromIP(ip)
    
    return NextResponse.json({
      success: true,
      testIp: {
        ip: testIp,
        location: testLocation
      },
      realIp: {
        ip: ip,
        location: realLocation
      },
      headers: {
        'x-forwarded-for': forwarded,
        'x-real-ip': real
      }
    })
  } catch (error) {
    console.error('Erreur test geo:', error)
    return NextResponse.json({ 
      error: 'Erreur test geo',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}