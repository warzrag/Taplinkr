import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getFirestore, Firestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

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
    return initializeApp({ credential: cert(sa) })
  }
  return initializeApp()
}

app = getApp()
export const db: Firestore = getFirestore(app)
export const adminAuth: Auth = getAuth(app)
export { Timestamp, FieldValue }
