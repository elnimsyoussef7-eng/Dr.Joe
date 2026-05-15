import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZX2390lzngpNrqu5EZG-bAz9bjqKmXlY",
  authDomain: "dr-joe-for-sat.firebaseapp.com",
  projectId: "dr-joe-for-sat",
  storageBucket: "dr-joe-for-sat.firebasestorage.app",
  messagingSenderId: "459080493956",
  appId: "1:459080493956:web:2becd7cc767babd71dcbd1",
  measurementId: "G-NTVPQY8G51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, ref, uploadBytes, getDownloadURL, serverTimestamp };


