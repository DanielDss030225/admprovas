import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD0fEAS-uL8tklmBNzLMrBHZ3Hh5cK21mM",
  authDomain: "orange-fast.firebaseapp.com",
  databaseURL: "https://orange-fast-default-rtdb.firebaseio.com",
  projectId: "orange-fast",
  storageBucket: "orange-fast.appspot.com",
  messagingSenderId: "816303515640",
  appId: "1:816303515640:web:fb1356d7b9e6cd60d3580d",
  measurementId: "G-5M2Z7DSHM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

