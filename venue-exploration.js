let map;
let service;
let markers = [];
let currentLocation = { lat: 18.5204, lng: 73.8567 }; // Pune default

/* ================= INIT MAP ================= */
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: currentLocation,
    zoom: 13
  });

  service = new google.maps.places.PlacesService(map);
};

/* ================= SEARCH VENUES ================= */
window.searchVenues = function () {
  if (!service) {
    alert("Map not loaded yet. Please wait.");
    return;
  }

  const keywordInput = document.getElementById("searchInput").value.trim();
  const eventType = document.getElementById("eventType").value;

  const keyword = keywordInput || eventType;

  clearMarkers();
  document.getElementById("venueList").innerHTML = "";

  const request = {
    location: currentLocation,
    radius: 10000, // 10 km
    keyword: keyword
  };

  service.nearbySearch(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      document.getElementById("venueList").innerHTML =
        "<p class='muted'>No venues found. Try another search.</p>";
      return;
    }

    results.forEach(place => {
      addMarker(place);
      addVenueCard(place);
    });
  });
};

/* ================= MARKERS ================= */
function addMarker(place) {
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name
  });

  markers.push(marker);
}

function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

/* ================= VENUE CARD ================= */
function addVenueCard(place) {
  const div = document.createElement("div");
  div.className = "venue-card";

  div.innerHTML = `
    <h4>${place.name}</h4>
    <span>${place.vicinity || place.formatted_address || ""}</span><br>
    <span>⭐ ${place.rating || "N/A"}</span>
  `;

  document.getElementById("venueList").appendChild(div);
}
