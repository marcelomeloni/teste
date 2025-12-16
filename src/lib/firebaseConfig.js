import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Por segurança, mova estas chaves para variáveis de ambiente (.env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy...",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ticketfy-496a8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ticketfy-496a8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ticketfy-496a8.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "443226395123",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:443226395123:web:0a9c676a7b667ccf2cc286"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Função de login com Google - Atua como um provedor de identidade
export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Função de logout do Firebase
export const logout = () => {
  return signOut(auth);
};

// Exporta o objeto 'auth' para uso no AuthContext
export { auth };