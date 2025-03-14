// ✅ Import Supabase function
import { fetchLocations } from "./supabase.js";

/* ───────────────────────────────────── */
/* 🗺️  MAP INITIALIZATION                 */
/* ───────────────────────────────────── */

document.addEventListener("DOMContentLoaded", async function () {
    // ✅ Prevent initializing the map twice
    if (document.getElementById("map")._leaflet_id) {
        console.warn("Map is already initialized, skipping...");
        return;
    }

    // ✅ Initialize the Leaflet Map
    const map = L.map("map", {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
    }).setView([-6.2088, 106.8456], 6); // Default center: Jakarta, zoomed out to fit polygons

    // ✅ Load Map Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // ✅ Custom Marker Icon
    const customIcon = L.icon({
        iconUrl: "images/marker.png", // Replace with your marker image
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -35],
    });

    /* ───────────────────────────────────── */
    /* 📍 CLICK TO ADD MARKER & ZOOM         */
    /* ───────────────────────────────────── */

    let activeMarker = null;

    map.on("click", function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        // ✅ Remove previous marker if exists
        if (activeMarker) {
            map.removeLayer(activeMarker);
        }

        // ✅ Add new marker at clicked position
        activeMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        activeMarker.bindPopup(
            `📍 You clicked here:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
        ).openPopup();

        // ✅ Zoom into the marker
        map.setView([lat, lng], 14);
    });

    /* ───────────────────────────────────── */
    /* 📡 FETCH & LOAD MARKERS & POLYGONS    */
    /* ───────────────────────────────────── */

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

    /* ───────────────────────────────────── */
    /* 📜 SIDEBAR CATEGORY CLICK HANDLING    */
    /* ───────────────────────────────────── */

    document.querySelectorAll(".parent-item").forEach((item) => {
        item.addEventListener("click", function () {
            this.classList.toggle("open"); // ✅ Toggle sublist visibility
        });
    });

    /* ───────────────────────────────────── */
    /* 🔄 ENSURE MAP RESIZES PROPERLY        */
    /* ───────────────────────────────────── */

    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});
