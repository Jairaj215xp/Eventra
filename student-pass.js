/* ================= FIREBASE IMPORTS ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyC0z62X0noy6njzUTOLbzA0tv3D3B5gGQc",
  authDomain: "eventra-a07f8.firebaseapp.com",
  projectId: "eventra-a07f8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= AUTH GUARD ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "student.html";
    return;
  }

  loadPasses(user);
});

/* ================= LOAD PASSES ================= */
async function loadPasses(user) {
  const container = document.getElementById("passesContainer");
  container.innerHTML = "";

  const q = query(
    collection(db, "registrations"),
    where("studentUid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    container.innerHTML = `<p class="muted">No passes available yet</p>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();

    const card = document.createElement("div");
    card.className = "pass-card";

    const qrId = `qr-${doc.id}`;

    card.innerHTML = `
      <h3>${data.eventName}</h3>
      <div class="pass-meta">
        <strong>${data.studentName}</strong><br>
        Roll No: ${data.studentRoll}
      </div>

      <div class="qr-box">
        <div id="${qrId}"></div>
      </div>

      <div class="pass-footer">
        Eventra Digital Pass
      </div>
    `;

    container.appendChild(card);

    // Generate unique QR
    new QRCode(document.getElementById(qrId), {
      text: JSON.stringify({
        registrationId: doc.id,
        eventId: data.eventId,
        studentUid: data.studentUid
      }),
      width: 140,
      height: 140
    });
  });
}
