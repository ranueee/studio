
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeServices() {
    const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;
    if (!isConfigured) {
        console.warn("Firebase is not configured. Please check your .env.local file.");
        return { app: null, auth: null, db: null, storage: null };
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    
    // Connect to emulators if running in development
    if (process.env.NODE_ENV === 'development' && !auth.emulatorConfig) {
        // Before connecting, ensure no real network requests are made.
        // NOTE: This is a client-side check. For server-side, you might need different logic.
        if (typeof window !== 'undefined') {
            (auth as any)._canInitEmulator = true;
            connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
            connectFirestoreEmulator(db, '127.0.0.1', 8080);
            connectStorageEmulator(storage, '127.0.0.1', 9199);
        }
    }

    return { app, auth, db, storage };
}

// We call this function to get the services, which handles initialization.
const { app, auth, db, storage } = initializeServices();

export { app, auth, db, storage };
