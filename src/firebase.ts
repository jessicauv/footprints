import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDECX0s5IsIIunBDWYJITJO5yD1dTXsqxk",
  authDomain: "footprints-b8d5f.firebaseapp.com",
  projectId: "footprints-b8d5f",
  storageBucket: "footprints-b8d5f.firebasestorage.app",
  messagingSenderId: "681081145020",
  appId: "1:681081145020:web:6e8aa545bc72e0c3c932b9",
  measurementId: "G-9T081NRZXE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
const analytics = getAnalytics(app);
export default app;
