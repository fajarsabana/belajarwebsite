document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing Leaflet Map..."); // Debugging

    try {
        // Initialize the map
        const map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            dragging: true,
            zoomSnap: 0.5,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 60
        }).setView([-6.2088, 106.8456], 10); // Center map on Jakarta

        console.log("Map initialized successfully"); // Debugging

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
            iconUrl: 'images/marker.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -35]
        });

        // Add a Marker
        const marker = L.marker([-6.2088, 106.8456], { icon: customIcon }).addTo(map);
        marker.bindPopup("<b>Jakarta</b><br>Welcome to Indonesia!").openPopup();

        // Force the map to resize properly
        setTimeout(() => {
            map.invalidateSize();
            console.log("Map size refreshed");
        }, 500);

    } catch (error) {
        console.error("Leaflet map failed to load:", error);
    }
});
