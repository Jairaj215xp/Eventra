import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
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
let currentType = "expense";

/* ================= AUTH GUARD ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "organizer.html";
    return;
  }

  currentUser = user;
  loadFinanceData();
});

/* ================= MODAL CONTROL ================= */
window.openFinanceModal = function (type) {
  currentType = type;
  document.getElementById("modalTitle").innerText =
    type === "expense" ? "Add Expense" : "Add Income";

  document.getElementById("financeModal").classList.remove("hidden");
  document.getElementById("modalBackdrop").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("financeModal").classList.add("hidden");
  document.getElementById("modalBackdrop").classList.add("hidden");

  document.getElementById("amountInput").value = "";
  document.getElementById("dateInput").value = "";
  document.getElementById("purposeInput").value = "";
};

/* ================= SAVE ENTRY ================= */
window.saveFinance = async function () {
  const amount = Number(document.getElementById("amountInput").value);
  const date = document.getElementById("dateInput").value;
  const purpose = document.getElementById("purposeInput").value;

  if (!amount || !date || !purpose) {
    alert("Please fill all fields");
    return;
  }

  await addDoc(collection(db, "finance"), {
    uid: currentUser.uid,
    type: currentType,
    amount,
    date,
    purpose,
    createdAt: new Date()
  });

  closeModal();
  loadFinanceData();
};

/* ================= LOAD DATA ================= */
async function loadFinanceData() {
  const q = query(
    collection(db, "finance"),
    where("uid", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);

  let income = 0;
  let expense = 0;

  const tbody = document.getElementById("transactionsBody");
  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const d = doc.data();

    if (d.type === "income") income += d.amount;
    else expense += d.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.date}</td>
      <td>${d.type}</td>
      <td>${d.purpose}</td>
      <td class="${d.type === "income" ? "green" : "red"}">
        ₹ ${d.amount}
      </td>
    `;
    tbody.appendChild(row);
  });

  const assigned = 100000; // later from admin
  const remaining = assigned + income - expense;

  document.getElementById("assignedBudget").innerText = `₹ ${assigned}`;
  document.getElementById("totalIncome").innerText = `₹ ${income}`;
  document.getElementById("totalExpenses").innerText = `₹ ${expense}`;
  document.getElementById("remainingBalance").innerText = `₹ ${remaining}`;
}
