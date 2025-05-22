// lib/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBPkJTLmDwHI2DF_oMJq32yE5ALqAihvJ0",
  authDomain: "linkgpt-69ba4.firebaseapp.com",
  projectId: "linkgpt-69ba4",
  storageBucket: "linkgpt-69ba4.appspot.com",
  messagingSenderId: "999069122482",
  appId: "1:999069122482:web:065c15aaf36b029ebb6eab",
  measurementId: "G-1FZV4GMRFL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs };