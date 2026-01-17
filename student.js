import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE INIT ================= */
const firebaseConfig = {
  apiKey: "AIzaSyC0z62X0noy6njzUTOLbzA0tv3D3B5gGQc",
  authDomain: "eventra-a07f8.firebaseapp.com",
  projectId: "eventra-a07f8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

/* ================= STUDENT LOGIN ================= */
window.studentGoogleLogin = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(
      doc(db, "students", user.uid),
      {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        role: "student",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    window.location.href = "student-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
};
