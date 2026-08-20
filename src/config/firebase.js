import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// TODO: Replace with your actual Firebase config from Firebase Console
// Create a .env file in the root of the project to store these variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper function to upload photo and save metadata
export const uploadPhoto = async (file, guestName) => {
  try {
    // 1. Generate unique file name
    const fileName = `photos/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const storageRef = ref(storage, fileName);

    // 2. Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 3. Save metadata to Firestore
    const docRef = await addDoc(collection(db, "wedding_photos"), {
      guestName: guestName,
      photoUrl: downloadURL,
      createdAt: serverTimestamp(),
      storagePath: fileName
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error uploading photo to Firebase:", error);
    throw error;
  }
};

export { db, storage };
