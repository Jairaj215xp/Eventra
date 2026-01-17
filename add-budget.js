import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    serverTimestamp
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

/* AUTH GUARD */
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "admin.html";
    }
});

/* LOAD ORGANIZERS INTO DROPDOWN */
const organizerSelect = document.getElementById("organizerSelect");

async function loadOrganizers() {
    organizerSelect.innerHTML = "<option value=''>Select Organizer</option>";

    const snapshot = await getDocs(collection(db, "organizers"));

    snapshot.forEach(doc => {
        const org = doc.data();
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${org.name} (${org.email})`;
        organizerSelect.appendChild(option);
    });
}

loadOrganizers();

/* SAVE BUDGET */
document.getElementById("budgetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "budgets"), {
        organizerId: organizerSelect.value,
        organizerName: organizerSelect.options[organizerSelect.selectedIndex].text,
        totalBudget: Number(totalBudget.value),
        sponsorAmount: Number(sponsorAmount.value || 0),
        remarks: description.value,
        createdAt: serverTimestamp()
    });

    document.getElementById("successMsg").classList.remove("hidden");
    e.target.reset();

    setTimeout(() => {
        window.location.href = "existing-budgets.html";
    }, 1000);
});
