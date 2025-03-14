// ✅ Import Supabase function
import { fetchLocations } from "./supabase.js";

/* ───────────────────────────────────── */
/* 🗺️  MAP INITIALIZATION & TILE LAYERS  */
/* ───────────────────────────────────── */

export function initializeMap() {
    const map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
    }).setView([-6.2088, 106.8456], 6); // Default center: Jakarta, zoomed out to fit polygons

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    return map;
}

/* ───────────────────────────────────── */
/* 📌 MARKER & POLYGON HANDLING          */
/* ───────────────────────────────────── */

// ✅ Custom Marker Icon
const customIcon = L.icon({
    iconUrl: "images/marker.png", // Replace with your marker image
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
});

// ✅ Function to Load Markers & Polygons
export async function loadMapData(map) {
    try {
        console.log("Fetching locations from Supabase...");
        const locations = await fetchLocations();
        console.log("Locations received:", locations);

        locations.forEach((location) => {
            if (!location.geom) return;

            let shape; // Store marker or polygon

            // ✅ If "Point", add a marker
            if (location.geom.type === "Point") {
                let [lng, lat] = location.geom.coordinates;
                shape = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            }

            // ✅ If "Polygon", draw a polygon
            else if (location.geom.type === "Polygon") {
                let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                shape = L.polygon(polygonCoordinates, {
                    color: "blue",
                    fillColor: "blue",
                    fillOpacity: 0.3
                }).addTo(map);
            }

            // ✅ Add popup to both markers & polygons
            if (shape) {
                shape.bindPopup(`
                    <b>${location["Nama Lokasi"]}</b><br>
                    🏢 <b>Company:</b> ${location["Pemegang Wilus"]}<br>
                    ⚡ <b>PLN UID:</b> ${location["UID"]}<br>
                `);
            }
        });

        console.log("Shapes added:", locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
    }
}
