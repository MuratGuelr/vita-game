import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCztBJMs8ZATpWGpUaUSaimukiLZeDTj6I",
  authDomain: "vita-game-56149.firebaseapp.com",
  projectId: "vita-game-56149",
  storageBucket: "vita-game-56149.appspot.com",
  messagingSenderId: "247339588657",
  appId: "1:247339588657:web:2c6265b0199483e485c910",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
export default app;
