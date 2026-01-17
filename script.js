/* ==================================================
   FIREBASE CONFIG & INIT (GLOBAL)
================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* Firebase config */
const firebaseConfig = {
    apiKey: "AIzaSyC0z62X0noy6njzUTOLbzA0tv3D3B5gGQc",
    authDomain: "eventra-a07f8.firebaseapp.com",
    projectId: "eventra-a07f8",
    storageBucket: "eventra-a07f8.appspot.com",
    messagingSenderId: "287969664964",
    appId: "1:287969664964:web:e92e0ed05b973f18724e91"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

/* ==================================================
   INDEX PAGE – TYPEWRITER
================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const target = document.getElementById("typewriter");
    if (!target) return;

    const text = "Eventra...";
    let index = 0;

    function type() {
        if (index < text.length) {
            target.textContent += text.charAt(index);
            index++;
            setTimeout(type, 120);
        }
    }
    type();
});

/* ==================================================
   CONTACT PAGE – GOOGLE SHEETS FORM
================================================== */
const contactForm = document.getElementById("contactForm");
const popup = document.getElementById("popup");

const scriptURL =
    "https://script.google.com/macros/s/AKfycbw7DZoi88FH0H6MRzyjf143nzUHB8Y1DR4lhxMmqYxMc1zAIltJyyUYB89rcyl0USMC/exec";

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        fetch(scriptURL, {
            method: "POST",
            body: new FormData(contactForm)
        }).catch(console.error);

        popup.style.display = "block";
        contactForm.reset();

        setTimeout(() => popup.style.display = "none", 3000);
    });
}

/* ==================================================
   ADMIN GOOGLE LOGIN
================================================== */
window.adminGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "admins", user.uid), {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            role: "admin",
            createdAt: new Date()
        }, { merge: true });

        window.location.href = "admin-dashboard.html";
    } catch (err) {
        alert(err.message);
    }
};

/* ==================================================
   ORGANIZER GOOGLE LOGIN
================================================== */
window.organizerGoogleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, "organizers", user.uid), {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            role: "organizer",
            createdAt: new Date()
        }, { merge: true });

        window.location.href = "organizer-dashboard.html";
    } catch (err) {
        alert(err.message);
    }
};

/* ==================================================
   AUTH STATE LISTENER
================================================== */
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Logged in:", user.email);
    }
});

/* ==================================================
   LOGOUT
================================================== */
window.logout = async () => {
    await signOut(auth);
    window.location.href = "index.html";
};
