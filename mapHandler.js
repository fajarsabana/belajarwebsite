import { fetchLocations } from "./supabase.js";

// ✅ Initialize Leaflet Map
export function initializeMap() {
    const map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60
    }).setView([-6.2088, 106.8456], 10); // Default center: Jakarta

    // ✅ Load Map Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    console.log("✅ Leaflet Map Initialized");
    return map;
}

// ✅ Custom Marker Icon
const customIcon = L.icon({
    iconUrl: "images/marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
});

// ✅ Function to Load Data & Populate Map + Sidebar (NO NAME CHANGES!)
export async function loadMapAndSidebar(map) {
    console.log("Fetching locations from Supabase...");
    const locations = await fetchLocations();
    console.log("Locations received:", locations);

    const sidebar = document.querySelector(".sidebar ul");
    if (!sidebar) {
        console.error("Sidebar list not found! Ensure index.html contains `<ul>` inside `.sidebar`.");
        return;
    }

    // ✅ Organize locations by "Pemegang Wilus"
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

    // ✅ Populate Sidebar & Map
    for (const company in groupedData) {
        const locationsUnderCompany = groupedData[company];

        // 🔹 If only **ONE** `Nama Lokasi`, show it as a **direct item**
        if (locationsUnderCompany.length === 1) {
            let location = locationsUnderCompany[0];
            let singleItem = document.createElement("li");
            singleItem.textContent = `${company} - ${location["Nama Lokasi"]}`;

            // ✅ Click to Zoom into Marker/Polygon
            singleItem.addEventListener("click", function () {
                if (location.geom.type === "Point") {
                    map.setView([location.geom.coordinates[1], location.geom.coordinates[0]], 14);
                } else if (location.geom.type === "Polygon") {
                    let bounds = L.latLngBounds(location.geom.coordinates[0].map(coord => [coord[1], coord[0]]));
                    map.fitBounds(bounds);
                }
            });

            sidebar.appendChild(singleItem);
        } 
        else {
            // 🔹 If multiple `Nama Lokasi`, keep them as **subcategories**
            let companyItem = document.createElement("li");
            companyItem.classList.add("parent-item");
            companyItem.textContent = company;

            let sublist = document.createElement("ul");
            sublist.classList.add("sublist");

            locationsUnderCompany.forEach((location) => {
                let subItem = document.createElement("li");
                subItem.textContent = location["Nama Lokasi"];

                // ✅ Click to Zoom into Marker/Polygon
                subItem.addEventListener("click", function () {
                    if (location.geom.type === "Point") {
                        map.setView([location.geom.coordinates[1], location.geom.coordinates[0]], 14);
                    } else if (location.geom.type === "Polygon") {
                        let bounds = L.latLngBounds(location.geom.coordinates[0].map(coord => [coord[1], coord[0]]));
                        map.fitBounds(bounds);
                    }
                });

                sublist.appendChild(subItem);
            });

            companyItem.appendChild(sublist);
            sidebar.appendChild(companyItem);

            // ✅ Sidebar Toggle
            companyItem.addEventListener("click", function () {
                this.classList.toggle("open");
            });
        }
    }

    console.log("✅ Map and Sidebar Loaded Successfully!");
}

// ✅ Double-Click to Add Marker
export function enableDoubleClickMarker(map) {
    let activeMarker = null;
    map.on("dblclick", function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        if (activeMarker) {
            map.removeLayer(activeMarker);
        }

        activeMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        activeMarker.bindPopup(`📍 Marker placed here:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`).openPopup();
        map.setView([lat, lng], 14);
    });

    console.log("✅ Double-Click Marker Enabled");
}

// ✅ Setup Map with Sidebar & Data (NO NAME CHANGES!)
export async function setupMap() {
    const map = initializeMap();
    await loadMapAndSidebar(map);
    enableDoubleClickMarker(map);
}
