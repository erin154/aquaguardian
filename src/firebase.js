import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCi7GrTX2QeZAznGcz2gHz8P22nBtJslDw",
  authDomain: "aquaguardian-f4652.firebaseapp.com",
  projectId: "aquaguardian-f4652",
  storageBucket: "aquaguardian-f4652.firebasestorage.app",
  messagingSenderId: "433530955979",
  appId: "1:433530955979:web:2183dfd9b39bb55255d34e"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)