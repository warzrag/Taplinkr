import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getFirestore, Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

let app: App

function getApp(): App {
  if (getApps().length > 0) return getApps()[0]

  // Three ways to provide credentials:
  // 1) FIREBASE_SERVICE_ACCOUNT_JSON env var with JSON string (recommended for Vercel)
  // 2) GOOGLE_APPLICATION_CREDENTIALS env var pointing to a JSON file
  // 3) Default ADC (works on GCP)
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (json) {
    const sa = JSON.parse(json)
    return initializeApp({
      credential: cert(sa),
      storageBucket: getFirebaseStorageBucket(sa.project_id),
    })
  }
  return initializeApp({
    storageBucket: getFirebaseStorageBucket(process.env.GOOGLE_CLOUD_PROJECT),
  })
}

app = getApp()
export const db: Firestore = getFirestore(app)
export const adminAuth: Auth = getAuth(app)
export const adminStorage = getStorage(app)
export { Timestamp, FieldValue }

export function getFirebaseStorageBucket(projectId?: string) {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (projectId ? `${projectId}.firebasestorage.app` : undefined)
  )
}

export function getDefaultBucket() {
  const bucketName = getFirebaseStorageBucket()
  return bucketName ? adminStorage.bucket(bucketName) : adminStorage.bucket()
}
