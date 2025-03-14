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

// ✅ Custom Marker Icon (Ensure this is accessible)
const customIcon = L.icon({
    iconUrl: "images/marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
});

// ✅ Exported Function to Initialize & Load Map Data
export async function setupMap() {
    const map = initializeMap();
    await loadMapData(map);
}
