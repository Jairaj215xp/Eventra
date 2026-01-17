import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* Firebase Config */
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

/* AUTH GUARD */
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "organizer.html";
        return;
    }

    const snap = await getDoc(doc(db, "organizers", user.uid));
    if (!snap.exists()) {
        alert("Access denied");
        await signOut(auth);
        window.location.href = "index.html";
        return;
    }

    document.getElementById("welcomeText").innerText =
        `Welcome, ${user.displayName}`;

    document.getElementById("organizerAvatar").src =
        user.photoURL || "https://via.placeholder.com/60";
});

/* LOGOUT */
window.logout = async function () {
    await signOut(auth);
    window.location.href = "index.html";
};

/* NAVIGATION */
window.goTo = function (page) {
    window.location.href = page;
};
