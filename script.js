// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Section Fade-in on Scroll
const sections = document.querySelectorAll(".fade-section");
function revealSections() {
    sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight * 0.85) {
            section.classList.add("visible");
        }
    });
}
window.addEventListener("scroll", revealSections);
revealSections();

// Initialize the Leaflet Map
const map = L.map('map').setView([-6.2088, 106.8456], 10); // Jakarta

// Load Map Tiles (Light Mode)
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Load Map Tiles (Dark Mode)
const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; Carto'
});

// Set default to Light Mode
lightTiles.addTo(map);

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

// Detect if user is on mobile
const isMobile = window.innerWidth <= 768;

// Initialize the map
const map = L.map('map', {
    scrollWheelZoom: false, // Disable scroll zoom globally
    dragging: true,         // Enable dragging on all devices
    tap: !isMobile,         // Prevents accidental taps on mobile
}).setView([-6.2088, 106.8456], 10);

// Load Map Tiles (Light Mode)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

