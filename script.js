import { fetchLocations } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async function () {
    console.log("Fetching locations from Supabase...");
    const locations = await fetchLocations();
    console.log("Locations received:", locations);

    // ✅ Initialize Leaflet Map
    const map = L.map("map").setView([-6.2088, 106.8456], 10); // Jakarta

    // ✅ Load Map Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // ✅ Custom Marker Icon
    const customIcon = L.icon({
        iconUrl: "images/marker.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35],
    });

    let activeMarker = null; // Store active marker

    // ✅ Double-click to Add Marker
    map.on("dblclick", function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        // Remove previous marker if exists
        if (activeMarker) {
            map.removeLayer(activeMarker);
        }

        // Add new marker at double-clicked position
        activeMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        activeMarker.bindPopup(
            `📍 Marker placed here:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
        ).openPopup();

        // Zoom into the marker
        map.setView([lat, lng], 14);
    });

    // ✅ Generate Sidebar with "Pemegang Wilus" as Categories
    const sidebar = document.querySelector(".sidebar ul");

    if (!sidebar) {
        console.error("Sidebar list not found! Ensure index.html contains `<ul>` inside `.sidebar`.");
        return;
    }

    // ✅ Organize locations by "Pemegang Wilus" (Company Name)
    const groupedData = {};
    locations.forEach((location) => {
        if (!location["Pemegang Wilus"] || !location["Nama Lokasi"] || !location.geom) return;

        let company = location["Pemegang Wilus"];
        let place = location["Nama Lokasi"];

        if (!groupedData[company]) {
            groupedData[company] = [];
        }
        groupedData[company].push(location);
    });

    // ✅ Populate the Sidebar Dynamically
    for (const company in groupedData) {
        let companyItem = document.createElement("li");
        companyItem.classList.add("parent-item");
        companyItem.textContent = company;

        let sublist = document.createElement("ul");
        sublist.classList.add("sublist");

        groupedData[company].forEach((location) => {
            let subItem = document.createElement("li");
            subItem.textContent = location["Nama Lokasi"];

            // ✅ Click to Zoom into Marker/Polygon
            subItem.addEventListener("click", function () {
                if (location.geom.type === "Point") {
                    let [lng, lat] = location.geom.coordinates;
                    map.setView([lat, lng], 14);
                } else if (location.geom.type === "Polygon") {
                    let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                    let bounds = L.latLngBounds(polygonCoordinates);
                    map.fitBounds(bounds);
                }
            });

            sublist.appendChild(subItem);
        });

        companyItem.appendChild(sublist);
        sidebar.appendChild(companyItem);

        // ✅ Sidebar Toggle Functionality
        companyItem.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    }

    // ✅ Scroll Animation for Sections
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                }
            });
        },
        { threshold: 0.2 }
    );

    document.querySelectorAll(".fade-in").forEach((section) => {
        observer.observe(section);
    });
});
