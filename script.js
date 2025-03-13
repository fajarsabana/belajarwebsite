// Ensure map initializes only after the page loads
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the Leaflet Map
    const map = L.map('map', {
        scrollWheelZoom: true, // Disable scroll zoom to prevent interference with page scroll
        dragging: true,         // Enable dragging everywhere
    }).setView([-6.2088, 106.8456], 10); // Center the map on Jakarta

    // Load Map Tiles (Light Mode)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
});
