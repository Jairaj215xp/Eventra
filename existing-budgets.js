import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const table = document.getElementById("budgetTable");
let budgets = [];
let editId = null;

/* AUTH GUARD */
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "admin.html";
    } else {
        loadBudgets();
    }
});

/* LOAD BUDGETS */
async function loadBudgets() {
    const snapshot = await getDocs(collection(db, "budgets"));
    budgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable(budgets);
}

function renderTable(data) {
    table.innerHTML = "";
    data.forEach(b => {
        table.innerHTML += `
            <tr>
                <td>${b.organizerName}</td>
                <td>₹${b.totalBudget}</td>
                <td>₹${b.sponsorAmount || 0}</td>
                <td>${b.remarks || "-"}</td>
                <td>
                    <span class="action-btn edit" onclick="openEdit('${b.id}')">Edit</span>
                    <span class="action-btn delete" onclick="removeBudget('${b.id}')">Delete</span>
                </td>
            </tr>
        `;
    });
}

/* SEARCH */
window.filterBudgets = function () {
    const q = document.getElementById("searchInput").value.toLowerCase();
    renderTable(
        budgets.filter(b =>
            b.organizerName.toLowerCase().includes(q)
        )
    );
};

/* DELETE */
window.removeBudget = async function (id) {
    if (!confirm("Delete this budget?")) return;
    await deleteDoc(doc(db, "budgets", id));
    loadBudgets();
};

/* EDIT */
window.openEdit = function (id) {
    editId = id;
    const b = budgets.find(x => x.id === id);

    editTotal.value = b.totalBudget;
    editSponsor.value = b.sponsorAmount || 0;
    editRemarks.value = b.remarks || "";

    document.getElementById("editModal").classList.remove("hidden");
};

window.closeModal = function () {
    document.getElementById("editModal").classList.add("hidden");
};

window.saveEdit = async function () {
    await updateDoc(doc(db, "budgets", editId), {
        totalBudget: Number(editTotal.value),
        sponsorAmount: Number(editSponsor.value),
        remarks: editRemarks.value
    });

    closeModal();
    loadBudgets();
};
