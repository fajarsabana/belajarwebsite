document.addEventListener("DOMContentLoaded", function () {
    // Initialize the Leaflet Map
    const map = L.map('map', {
        zoomControl: true, // Keep zoom buttons
        scrollWheelZoom: true, // Enable zooming with mouse scroll
        dragging: true, // Allow dragging anywhere on the map
        zoomSnap: 0.5, // Allows smooth zooming
        zoomDelta: 0.5, // Ensures zooming isn't too fast
        wheelPxPerZoomLevel: 60, // Makes zooming follow the mouse position
    }).setView([-6.2088, 106.8456], 10); // Center map on Jakarta

    // Load Map Tiles (Light Mode)
    const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load Map Tiles (Dark Mode)
    const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; Carto'
    });

    // Dark Mode Toggle for Map
    document.getElementById("dark-mode-toggle").addEventListener("click", function () {
        if (document.body.classList.contains("dark-mode")) {
            map.removeLayer(lightTiles);
            darkTiles.addTo(map);
        } else {
            map.removeLayer(darkTiles);
            lightTiles.addTo(map);
        }
    });

    // Custom Marker Icon
    const customIcon = L.icon({
        iconUrl: 'images/marker.png', // Replace with your custom marker image
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35]
    });

    // Add a Marker
    const marker = L.marker([-6.2088, 106.8456], { icon: customIcon }).addTo(map);

    // Add a Popup
    marker.bindPopup("<b>Jakarta</b><br>Welcome to Indonesia!").openPopup();

    // **FORCE REFRESH THE MAP SIZE TO FIX ANY DRAG ISSUES**
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});
