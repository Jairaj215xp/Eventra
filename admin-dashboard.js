
import { auth, db, collection, addDoc, getDocs, customQuery, where, onAuthStateChanged } from "./script.js";

/* ==================================================
   STATE MANAGEMENT
================================================== */
const state = {
    currentTab: 'organizers',
    currentSubTab: 'org-list'
};

/* ==================================================
   INIT & AUTH CHECK
================================================== */
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("adminName").innerText = user.displayName || "Admin";
        document.getElementById("adminAvatar").src = user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`;
        loadOrganizers(); // Initial load
    } else {
        // window.location.href = "admin.html";
        // Dev mode: allow rendering but warn
        console.warn("No user logged in (Dev Mode)");
        loadOrganizers();
    }
});

/* ==================================================
   TAB SWITCHING LOGIC
================================================== */
window.switchTab = (tabName) => {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update Content
    document.querySelectorAll('.dashboard-tab').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    // Update Header
    const titles = {
        'organizers': 'Organizer Management',
        'budget': 'Budget Manager',
        'analytics': 'Platform Analytics'
    };
    document.getElementById('pageTitle').innerText = titles[tabName];

    state.currentTab = tabName;

    if (tabName === 'analytics') {
        renderChart();
    }
    if (tabName === 'budget') {
        loadBudgetData();
    }
};

window.switchSubTab = (subTabName) => {
    document.querySelectorAll('.sub-tab').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (subTabName === 'org-list') {
        document.getElementById('view-org-list').classList.remove('hidden');
        document.getElementById('view-org-add').classList.add('hidden');
        loadOrganizers();
    } else {
        document.getElementById('view-org-list').classList.add('hidden');
        document.getElementById('view-org-add').classList.remove('hidden');
    }
};

/* ==================================================
   ORGANIZER MANAGEMENT
================================================== */
async function loadOrganizers() {
    const tbody = document.getElementById("organizerTableBody");
    tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const q = customQuery(collection(db, "users"), where("role", "==", "organizer"));
        const querySnapshot = await getDocs(q);

        tbody.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${data.photo || 'https://via.placeholder.com/30'}" style="width:30px;height:30px;border-radius:50%">
                        ${data.name}
                    </div>
                </td>
                <td>${data.email}</td>
                <td><span class="status-badge status-active">Organizer</span></td>
                <td><span class="status-badge status-active">Active</span></td>
                <td><button onclick="deleteOrganizer('${doc.id}')" style="border:none;background:none;cursor:pointer;color:red">🗑️</button></td>
            `;
            tbody.appendChild(tr);
        });

        if (querySnapshot.empty) {
            tbody.innerHTML = "<tr><td colspan='5'>No organizers found.</td></tr>";
        }

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan='5'>Error: ${err.message}</td></tr>`;
    }
}

document.getElementById("addOrganizerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("orgName").value;
    const email = document.getElementById("orgEmail").value;
    const dept = document.getElementById("orgDept").value;
    const budget = document.getElementById("orgBudget").value;

    try {
        // In a real app, we'd create a user via Admin SDK or trigger an email.
        // Here we simulated by adding to 'users' collection with role 'organizer'
        // This is a "Shadow" user until they actually login.

        await addDoc(collection(db, "users"), {
            name,
            email,
            dept,
            budget: Number(budget),
            role: "organizer",
            createdAt: new Date(),
            photo: `https://ui-avatars.com/api/?name=${name}`
        });

        alert("Organizer added successfully!");
        document.getElementById("addOrganizerForm").reset();
        switchSubTab('org-list'); // Go back to list
    } catch (err) {
        alert("Error: " + err.message);
    }
});

/* ==================================================
   BUDGET MANAGEMENT
================================================== */
async function loadBudgetData() {
    const tbody = document.getElementById("budgetTableBody");
    tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    // Same query as organizers, just different view
    const q = customQuery(collection(db, "users"), where("role", "==", "organizer"));
    const snapshot = await getDocs(q);

    tbody.innerHTML = "";
    snapshot.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.name}</td>
            <td>${data.dept || 'N/A'}</td>
            <td>₹${data.budget || 0}</td>
            <td>₹${data.budget || 0}</td> <!-- Assuming no spend yet -->
            <td><button class="btn-primary" style="padding: 6px 12px; font-size:12px;">Update</button></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ==================================================
   ANALYTICS CHART
================================================== */
let chartInstance = null;
function renderChart() {
    const ctx = document.getElementById('adminChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cultural', 'Sports', 'Tech', 'Workshop', 'Seminar'],
            datasets: [{
                label: 'Event Participation',
                data: [120, 190, 30, 50, 20], // Dummy data
                backgroundColor: [
                    'rgba(37, 99, 235, 0.6)',
                    'rgba(147, 51, 234, 0.6)',
                    'rgba(37, 99, 235, 0.6)',
                    'rgba(147, 51, 234, 0.6)',
                    'rgba(37, 99, 235, 0.6)'
                ],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
