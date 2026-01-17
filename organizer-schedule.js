import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
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

let currentUser = null;

/* ================= AUTH GUARD ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "organizer.html";
    return;
  }
  currentUser = user;
  loadSchedules();
});

/* ================= MODAL ================= */
window.openScheduleModal = function () {
  document.getElementById("scheduleModal").classList.remove("hidden");
  document.getElementById("modalBackdrop").classList.remove("hidden");
};

window.closeScheduleModal = function () {
  document.getElementById("scheduleModal").classList.add("hidden");
  document.getElementById("modalBackdrop").classList.add("hidden");

  document.getElementById("titleInput").value = "";
  document.getElementById("dateInput").value = "";
  document.getElementById("startTimeInput").value = "";
  document.getElementById("endTimeInput").value = "";
  document.getElementById("descInput").value = "";
};

/* ================= SAVE SCHEDULE ================= */
window.saveSchedule = async function () {
  const title = document.getElementById("titleInput").value.trim();
  const date = document.getElementById("dateInput").value;
  const start = document.getElementById("startTimeInput").value;
  const end = document.getElementById("endTimeInput").value;
  const desc = document.getElementById("descInput").value.trim();

  if (!title || !date || !start || !end) {
    alert("Please fill all required fields");
    return;
  }

  await addDoc(collection(db, "schedules"), {
    uid: currentUser.uid,
    title,
    date,
    startTime: start,
    endTime: end,
    description: desc,
    createdAt: serverTimestamp()
  });

  closeScheduleModal();
  loadSchedules();
};

/* ================= LOAD SCHEDULES ================= */
async function loadSchedules() {
  const container = document.getElementById("scheduleContainer");
  container.innerHTML = "";

  const q = query(
    collection(db, "schedules"),
    where("uid", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = `<p class="muted">No schedules added yet</p>`;
    return;
  }

  snapshot.forEach(doc => {
    const s = doc.data();

    const card = document.createElement("div");
    card.className = "schedule-card";

    card.innerHTML = `
      <h3>${s.title}</h3>
      <p>${s.description || ""}</p>
      <span>📅 ${s.date}</span>
      <span>⏰ ${s.startTime} - ${s.endTime}</span>
    `;

    container.appendChild(card);
  });
}
