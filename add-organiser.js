// add-organiser.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ====== Firebase config (same as your other pages) ====== */
const firebaseConfig = {
  apiKey: "AIzaSyC0z62X0noy6njzUTOLbzA0tv3D3B5gGQc",
  authDomain: "eventra-a07f8.firebaseapp.com",
  projectId: "eventra-a07f8",
  storageBucket: "eventra-a07f8.appspot.com",
  messagingSenderId: "287969664964",
  appId: "1:287969664964:web:e92e0ed05b973f18724e91"
};

/* Initialize Firebase (safe to call again in another module) */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* DOM */
const form = document.getElementById("organizerForm");
const successMsg = document.getElementById("successMsg");
const saveBtn = document.getElementById("saveBtn");

/* Currently logged-in admin UID (filled by auth listener) */
let currentAdmin = null;

/* Auth guard: ensure only logged-in admins access this page.
   If not logged in, redirect to admin login page.
*/
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // not logged in -> redirect to admin sign-in
    window.location.href = "admin.html";
    return;
  }
  // user logged in
  currentAdmin = user;
});

/* Form submit handler:
   - Validate form will be ensured by required attributes
   - Save organizer doc to Firestore: collection "organizers"
   - Include createdBy (admin uid) and createdAt timestamp
   - On success: show message, then redirect to existing-organizers page
*/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentAdmin) {
    alert("Please sign in as an admin to add organizers.");
    window.location.href = "admin.html";
    return;
  }

  // read input values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const dept = document.getElementById("dept").value.trim();
  const year = parseInt(document.getElementById("year").value, 10);

  // basic client-side validation
  if (!name || !email) {
    alert("Please provide name and email");
    return;
  }

  // disable button while saving
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    // Add document to 'organizers' collection
    const docRef = await addDoc(collection(db, "organizers"), {
      name,
      email,
      phone,
      department: dept,
      yearOfStudy: isNaN(year) ? null : year,
      createdBy: currentAdmin.uid,
      createdByName: currentAdmin.displayName || null,
      createdAt: serverTimestamp()
    });

    // show success UI
    successMsg.classList.remove("hidden");

    // reset form
    form.reset();

    // short delay so user sees message, then redirect to existing-organizers page
    setTimeout(() => {
      window.location.href = "existing-organizers.html";
    }, 800);

  } catch (err) {
    console.error("Failed to save organizer:", err);
    alert("Failed to save organizer: " + (err.message || err));
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Organizer";
  }
});
