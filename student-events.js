import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyC0z62X0noy6njzUTOLbzA0tv3D3B5gGQc",
  authDomain: "eventra-a07f8.firebaseapp.com",
  projectId: "eventra-a07f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let selectedEvent = null;

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "student.html";
    return;
  }
  currentUser = user;
  loadEvents();
});

/* LOAD EVENTS */
async function loadEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  const grid = document.getElementById("eventsGrid");
  grid.innerHTML = "";

  snapshot.forEach(doc => {
    const e = doc.data();

    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${e.name}</h3>
      <span>📅 ${e.date}</span>
      <span>📍 ${e.venue}</span>
      <span>🏷️ ${e.type}</span>
      <button 
        id="register-btn-${doc.id}"
        class="register-btn">
        Register
    </button>
    `;

    card.querySelector("button").onclick = () => openModal(doc.id, e.name);
    grid.appendChild(card);
  });
}

/* MODAL */
window.openModal = function (eventId, eventName) {
  selectedEvent = eventId;

  document.getElementById("eventName").value = eventName;
  document.getElementById("studentName").value = currentUser.displayName;
  document.getElementById("studentEmail").value = currentUser.email;

  document.getElementById("modalBackdrop").style.display = "block";
  document.getElementById("registerModal").style.display = "block";
};

window.closeModal = function () {
  document.getElementById("modalBackdrop").style.display = "none";
  document.getElementById("registerModal").style.display = "none";
};

/* REGISTER */
window.submitRegistration = async function () {
  await addDoc(collection(db, "registrations"), {
    eventId: selectedEvent,
    studentId: currentUser.uid,
    studentName: document.getElementById("studentName").value,
    studentEmail: currentUser.email,
    department: document.getElementById("studentDept").value,
    year: document.getElementById("studentYear").value,
    createdAt: new Date()
  });

  alert("✅ Registered successfully");
  closeModal();
};
