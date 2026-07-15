// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyqVtbWBA4ZJgt_QU7GVtPC8tPnYbEdF8",
  authDomain: "door-sales.firebaseapp.com",
  projectId: "door-sales",
  storageBucket: "door-sales.firebasestorage.app",
  messagingSenderId: "516237537218",
  appId: "1:516237537218:web:71edf527248774e732705b",
  measurementId: "G-0X6P3Z7R13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
