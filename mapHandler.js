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

// ✅ Function to Load Data & Populate Map + Sidebar
export async function loadMapAndSidebar(map) {
    console.log("Fetching locations from Supabase...");
    const locations = await fetchLocations();
    console.log("Locations received:", locations);

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
        if (!groupedData[company]) {
            groupedData[company] = [];
        }
        groupedData[company].push(location);
    });

    // ✅ Populate Sidebar & Map
    for (const company in groupedData) {
        let locations = groupedData[company];

        // If the company has only one location, display the location directly
        if (locations.length === 1) {
            let location = locations[0];
            let subItem = document.createElement("li");
            subItem.textContent = location["Nama Lokasi"];

            // ✅ Click to Zoom
            subItem.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent sidebar toggle

                console.log("📍 Sidebar location clicked:", location["Nama Lokasi"], location.geom);

                if (location.geom && location.geom.type === "Point") {
                    map.setView([location.geom.coordinates[1], location.geom.coordinates[0]], 14, { animate: true, duration: 1 });
                } 
                else if (location.geom && location.geom.type === "Polygon" 
                    && Array.isArray(location.geom.coordinates) 
                    && location.geom.coordinates.length > 0 
                    && Array.isArray(location.geom.coordinates[0])) {  

                    let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                    let bounds = L.latLngBounds(polygonCoordinates);
                    map.fitBounds(bounds, { animate: true, padding: [50, 50] });
                } 
                else {
                    console.warn("❌ No valid geometry for:", location["Nama Lokasi"]);
                }
            });

            sidebar.appendChild(subItem); // ✅ Add directly without the company name
        } 
        else {
            // If the company has multiple locations, create a collapsible company item
            let companyItem = document.createElement("li");
            companyItem.classList.add("parent-item");
            companyItem.textContent = company;

            let sublist = document.createElement("ul");
            sublist.classList.add("sublist");
            sublist.style.display = "none"; // Hide by default

            locations.forEach((location) => {
                let subItem = document.createElement("li");
                subItem.textContent = location["Nama Lokasi"];

                // ✅ Click to Zoom
                subItem.addEventListener("click", function (event) {
                    event.stopPropagation(); // Prevent sidebar toggle

                    console.log("📍 Sidebar location clicked:", location["Nama Lokasi"], location.geom);

                    if (location.geom && location.geom.type === "Point") {
                        map.setView([location.geom.coordinates[1], location.geom.coordinates[0]], 14, { animate: true, duration: 1 });
                    } 
                    else if (location.geom && location.geom.type === "Polygon" 
                        && Array.isArray(location.geom.coordinates) 
                        && location.geom.coordinates.length > 0 
                        && Array.isArray(location.geom.coordinates[0])) {  

                        let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                        let bounds = L.latLngBounds(polygonCoordinates);
                        map.fitBounds(bounds, { animate: true, padding: [50, 50] });
                    } 
                    else {
                        console.warn("❌ No valid geometry for:", location["Nama Lokasi"]);
                    }
                });

                sublist.appendChild(subItem);
            });

            companyItem.appendChild(sublist);
            sidebar.appendChild(companyItem);

            // ✅ Toggle Company Item
            companyItem.addEventListener("click", function () {
                sublist.style.display = sublist.style.display === "none" ? "block" : "none";
            });
        }
    }
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

// ✅ Setup Map with Sidebar & Data
export async function setupMap() {
    const map = initializeMap();
    await loadMapAndSidebar(map);
    enableDoubleClickMarker(map);
}
