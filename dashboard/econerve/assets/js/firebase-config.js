// ============================================================
// EcoNerve – Firebase Configuration
// Replace the firebaseConfig object with your actual Firebase
// project credentials from the Firebase Console.
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBtRZpkJXddd55o89GT_0_Y7BgTPsvIexg",
  authDomain: "delhi-aqi-6ed7a.firebaseapp.com",
  databaseURL: "https://delhi-aqi-6ed7a-default-rtdb.firebaseio.com",
  projectId: "delhi-aqi-6ed7a",
  storageBucket: "delhi-aqi-6ed7a.firebasestorage.app",
  messagingSenderId: "634771510538",
  appId: "1:634771510538:web:58b1bfb226c85bd66096f3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Exported references used across all modules
const auth = firebase.auth();
const db   = firebase.database();
