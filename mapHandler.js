import { fetchLocations } from "./supabase.js";

// ✅ Initialize Leaflet Map
export function initializeMap() {
    const map = L.map("map").setView([-6.2088, 106.8456], 6); // Default center: Jakarta

    // ✅ Load Map Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    console.log("✅ Leaflet Map Initialized");
    return map;
}

// ✅ Function to Load & Display Locations (Markers & Polygons)
export async function loadMapData(map) {
    console.log("Fetching locations from Supabase...");
    const locations = await fetchLocations();

    console.log("Locations received:", locations);

    // ✅ Iterate through locations and add Markers or Polygons
    locations.forEach((location) => {
        if (!location.geom) return; // Skip invalid data

        let shape; // Store either marker or polygon

        if (location.geom.type === "Point") {
            // ✅ Add Marker for Point Data
            let [lng, lat] = location.geom.coordinates;
            shape = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        } 
        else if (location.geom.type === "Polygon") {
            // ✅ Fix Polygon Coordinate Order (Ensure [lat, lng])
            let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);

            console.log("Adding Polygon with coordinates:", polygonCoordinates); // ✅ Debugging

            // ✅ Create Polygon with Proper Styling
            shape = L.polygon(polygonCoordinates, {
                color: "#0077b6",  /* Border Color */
                fillColor: "#0096c7",  /* Inside Color */
                fillOpacity: 0.4,  /* Adjust visibility */
                weight: 2
            }).addTo(map);
        }

        // ✅ Add Popup to Shape (Marker or Polygon)
        shape.bindPopup(`<b>${location["Nama Lokasi"]}</b><br>🏢 ${location["Pemegang Wilus"]}`);
    });

    console.log("✅ Map data successfully loaded!");
}

// ✅ Function to Generate Sidebar List
function generateSidebar(locations, map) {
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

    console.log("✅ Sidebar successfully populated!");
}

// ✅ Exported Function to Initialize & Load Map Data + Sidebar
export async function setupMap() {
    const map = initializeMap();
    const locations = await fetchLocations();
    await loadMapData(map, locations);
    generateSidebar(locations, map);
}

// ✅ Custom Marker Icon (Ensure this is accessible)
const customIcon = L.icon({
    iconUrl: "images/marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
});
