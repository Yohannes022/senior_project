// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyCSEusNS-UQAYkxJdP_OFglGVUCU1MtVYk",
  authDomain: "sheger-transit.firebaseapp.com",
  projectId: "sheger-transit",
  storageBucket: "sheger-transit.firebasestorage.app",
  messagingSenderId: "720244942778",
  appId: "1:720244942778:web:b2034e687764fface25f83",
  measurementId: "G-0R1SQ05VYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Example data model
export interface User {
  id?: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example collection references
export const collections = {
  users: 'users',
  // Add more collections as needed
};
