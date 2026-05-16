import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('Not found', { status: 404 })
}

export async function POST() {
  return new NextResponse('Not found', { status: 404 })
}
