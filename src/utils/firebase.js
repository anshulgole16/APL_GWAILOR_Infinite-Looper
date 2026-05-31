import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-your-firebase-key-here",
  authDomain: "cricmind-ai.firebaseapp.com",
  projectId: "cricmind-ai",
  storageBucket: "cricmind-ai.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

let db = null;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  db = firebase.firestore();
  console.log("Firebase initialized successfully");
} catch (e) {
  console.error("Firebase init failed: ", e);
}

export { db, firebase };
