document.addEventListener("DOMContentLoaded", function () {
    // Initialize the Leaflet Map
    const map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60
    }).setView([-6.2088, 106.8456], 10); // Center map on Jakarta

    // Load Map Tiles (Light Mode)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

        // Custom Marker Icon
    const customIcon = L.icon({
        iconUrl: 'images/marker.png', // Replace with your marker image
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
    });

    let activeMarker = null; // Store the currently active marker

    // Function to Add Marker on Click & Zoom to It
    map.on('click', function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        // Remove previous marker if exists
        if (activeMarker) {
            map.removeLayer(activeMarker);
        }

        // Add new marker at clicked position
        activeMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        activeMarker.bindPopup(`📍 You clicked here:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`).openPopup();

        // Zoom into the marker
        map.setView([lat, lng], 14); // Zoom level 14 (adjustable)
    });

    // Ensure the map resizes properly
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
    // Handle click on parent items to toggle sublist
    document.querySelectorAll(".parent-item").forEach(item => {
        item.addEventListener("click", function () {
            this.classList.toggle("open"); // Toggle open class
        });
    });
});
