import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR_laBiS7VjK7ADJL8SePRtqBQCflCNy0",
  authDomain: "rezzai-4dcd5.firebaseapp.com",
  projectId: "rezzai-4dcd5",
  storageBucket: "rezzai-4dcd5.firebasestorage.app",
  messagingSenderId: "74146917631",
  appId: "1:74146917631:web:c5f2e640504eebb3a670ca",
  measurementId: "G-7VB29BGTLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;



