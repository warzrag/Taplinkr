import { createClient } from '@supabase/supabase-js'

// Configuration Supabase pour TapLinkr
const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper pour récupérer les liens d'un utilisateur
export async function getUserLinks(userId: string) {
  const { data, error } = await supabase
    .from('Link')
    .select(`
      *,
      multiLinks:MultiLink(*)
    `)
    .eq('userId', userId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Erreur récupération liens:', error)
    return []
  }

  return data || []
}

// Helper pour créer un lien
export async function createLink(linkData: any) {
  const { data, error } = await supabase
    .from('Link')
    .insert(linkData)
    .select()
    .single()

  if (error) {
    console.error('Erreur création lien:', error)
    throw error
  }

  return data
}

// Helper pour mettre à jour un lien
export async function updateLink(linkId: string, updates: any) {
  const { data, error } = await supabase
    .from('Link')
    .update(updates)
    .eq('id', linkId)
    .select()
    .single()

  if (error) {
    console.error('Erreur mise à jour lien:', error)
    throw error
  }

  return data
}

// Helper pour supprimer un lien
export async function deleteLink(linkId: string) {
  const { error } = await supabase
    .from('Link')
    .delete()
    .eq('id', linkId)

  if (error) {
    console.error('Erreur suppression lien:', error)
    throw error
  }

  return true
}

// Helper pour créer des multilinks
export async function createMultiLinks(linkId: string, multiLinks: any[]) {
  if (!multiLinks || multiLinks.length === 0) return []

  const multiLinksData = multiLinks.map((ml, index) => ({
    id: `${linkId}_${index}_${Date.now()}`,
    linkId,
    title: ml.title,
    url: ml.url,
    icon: ml.icon || '',
    order: index,
    clicks: 0
  }))

  const { data, error } = await supabase
    .from('MultiLink')
    .insert(multiLinksData)
    .select()

  if (error) {
    console.error('Erreur création multilinks:', error)
    return []
  }

  return data || []
}

// Helper pour obtenir tous les utilisateurs (admin)
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('User')
    .select('id, email, username, createdAt')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Erreur récupération utilisateurs:', error)
    return []
  }

  return data || []
}

// Helper pour obtenir tous les liens (admin)
export async function getAllLinks() {
  const { data, error } = await supabase
    .from('Link')
    .select(`
      *,
      user:User(email, username)
    `)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Erreur récupération tous les liens:', error)
    return []
  }

  return data || []
}