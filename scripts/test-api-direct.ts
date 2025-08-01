import { NextRequest } from 'next/server'
import { POST } from '../app/api/teams/route'
import { getServerSession } from 'next-auth'

// Mock session for test
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

async function testApiDirect() {
  try {
    // Mock la session avec notre utilisateur test
    mockGetServerSession.mockResolvedValue({
      user: { 
        id: 'cmddq4jcf0000c303064nzumn',
        email: 'test@example.com' 
      }
    } as any)

    // Créer une requête mock
    const mockRequest = {
      json: async () => ({ name: 'Test Team Direct', description: 'Test description' })
    } as NextRequest

    console.log('🚀 Test API Direct - Début')
    
    // Appeler directement la fonction POST
    const response = await POST(mockRequest)
    const result = await response.json()
    
    console.log('📊 Status:', response.status)
    console.log('📋 Response:', result)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testApiDirect()