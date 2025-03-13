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
        iconUrl: 'images/marker.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
    });

    // Add a Marker
    const marker = L.marker([-6.2088, 106.8456], { icon: customIcon }).addTo(map);
    marker.bindPopup("<b>Jakarta</b><br>Welcome to Indonesia!").openPopup();

    // Ensure the map resizes properly
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});
