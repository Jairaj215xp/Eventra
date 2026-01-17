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

const table = document.getElementById("organizerTable");
let organizers = [];
let editId = null;

/* AUTH GUARD */
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "admin.html";
    } else {
        loadOrganizers();
    }
});

/* LOAD ORGANIZERS */
async function loadOrganizers() {
    const snapshot = await getDocs(collection(db, "organizers"));
    organizers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable(organizers);
}

function renderTable(data) {
    table.innerHTML = "";
    data.forEach(o => {
        table.innerHTML += `
            <tr>
                <td>${o.name}</td>
                <td>${o.email}</td>
                <td>${o.department || "-"}</td>
                <td>${o.yearOfStudy || "-"}</td>
                <td>
                    <span class="action-btn edit" onclick="openEdit('${o.id}')">Edit</span>
                    <span class="action-btn delete" onclick="remove('${o.id}')">Delete</span>
                </td>
            </tr>
        `;
    });
}

/* SEARCH */
window.filterOrganizers = function () {
    const q = document.getElementById("searchInput").value.toLowerCase();
    renderTable(
        organizers.filter(o =>
            o.name.toLowerCase().includes(q) ||
            o.email.toLowerCase().includes(q)
        )
    );
};

/* DELETE */
window.remove = async function (id) {
    if (!confirm("Delete this organizer?")) return;
    await deleteDoc(doc(db, "organizers", id));
    loadOrganizers();
};

/* EDIT */
window.openEdit = function (id) {
    editId = id;
    const o = organizers.find(x => x.id === id);
    document.getElementById("editName").value = o.name;
    document.getElementById("editDept").value = o.department || "";
    document.getElementById("editYear").value = o.yearOfStudy || "";
    document.getElementById("editModal").classList.remove("hidden");
};

window.closeModal = function () {
    document.getElementById("editModal").classList.add("hidden");
};

window.saveEdit = async function () {
    await updateDoc(doc(db, "organizers", editId), {
        name: editName.value,
        department: editDept.value,
        yearOfStudy: Number(editYear.value)
    });
    closeModal();
    loadOrganizers();
};
