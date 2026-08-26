import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore'

/** Public reCAPTCHA v3 site key for Firebase App Check — this is the client-facing site
 *  key, not a secret (verification happens server-side against Google); safe to ship. */
const RECAPTCHA_V3_SITE_KEY = '6Lfb4ZktAAAAACTEbTimAcHUxkGGbLIaBDlaVvoT'

type FirebaseRuntime = { app: FirebaseApp; auth: Auth; db: Firestore }

let runtime: FirebaseRuntime | null = null
let signedIn: Promise<User> | null = null

function config() {
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'] as const
  const values = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID }
  const missing = required.filter((key) => !import.meta.env[key])
  if (missing.length) throw new Error(`Firebase 환경변수가 없습니다: ${missing.join(', ')}`)
  return values
}

export function firebaseRuntime(): FirebaseRuntime {
  if (runtime) return runtime
  const app = getApps().length ? getApp() : initializeApp(config())
  const useEmulator = import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true'
  /** reCAPTCHA v3 can't verify against the emulator or a local dev origin, so App Check
   *  is only wired up for the deployed production build. */
  if (!useEmulator && import.meta.env.PROD) {
    initializeAppCheck(app, { provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY), isTokenAutoRefreshEnabled: true })
  }
  const auth = getAuth(app); const db = getFirestore(app)
  if (useEmulator) {
    const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1'
    const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099)
    const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8081)
    connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true })
    connectFirestoreEmulator(db, host, firestorePort)
  }
  runtime = { app, auth, db }
  return runtime
}

/** Fast refresh and multiple components share this one anonymous sign-in request. */
export async function ensureAnonymousFirebaseUser(): Promise<User> {
  const { auth } = firebaseRuntime()
  if (auth.currentUser) return auth.currentUser
  signedIn ??= signInAnonymously(auth).then(({ user }) => user).catch((error: unknown) => { signedIn = null; throw error })
  return signedIn
}
