const auth = firebase.auth();
const db = firebase.firestore();

/* ================= DOM ELEMENTS ================= */
const eventsList = document.getElementById("eventsList");
const modal = document.getElementById("eventModal");
const backdrop = document.getElementById("modalBackdrop");

const nameInput = document.getElementById("eventName");
const typeInput = document.getElementById("eventType");
const dateInput = document.getElementById("eventDate");
const venueInput = document.getElementById("eventVenue");
const descInput = document.getElementById("eventDesc");

let currentOrganizerId = null;

/* ================= MODAL CONTROLS ================= */
window.openEventModal = function () {
    modal.classList.remove("hidden");
    backdrop.classList.remove("hidden");
};

window.closeEventModal = function () {
    modal.classList.add("hidden");
    backdrop.classList.add("hidden");

    nameInput.value = "";
    typeInput.value = "";
    dateInput.value = "";
    venueInput.value = "";
    descInput.value = "";
};

/* ================= AUTH CHECK ================= */
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "organizer.html";
        return;
    }

    currentOrganizerId = user.uid;
    loadEvents();
});

/* ================= CREATE EVENT ================= */
window.createEvent = async function () {
    const name = nameInput.value.trim();
    const type = typeInput.value;
    const date = dateInput.value;
    const venue = venueInput.value.trim();
    const description = descInput.value.trim();

    if (!name || !type || !date || !venue) {
        alert("Please fill all required fields");
        return;
    }

    await db
        .collection("organizers")
        .doc(currentOrganizerId)
        .collection("events")
        .add({
            name,
            type,
            date,
            venue,
            description,
            organizerId: currentOrganizerId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

    closeEventModal();
    loadEvents();
};

/* ================= LOAD EVENTS ================= */
async function loadEvents() {
    eventsList.innerHTML = "";

    const snapshot = await db
        .collection("organizers")
        .doc(currentOrganizerId)
        .collection("events")
        .orderBy("createdAt", "desc")
        .get();

    if (snapshot.empty) {
        eventsList.innerHTML = `<p class="muted">No events created yet</p>`;
        return;
    }

    snapshot.forEach(doc => {
        const event = doc.data();

        const card = document.createElement("div");
        card.className = "event-card";

        card.innerHTML = `
            <h3>${event.name}</h3>
            <p>${event.type} • ${event.date}</p>
            <small>${event.venue}</small>
        `;

        eventsList.appendChild(card);
    });
}
