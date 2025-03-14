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
    }).setView([-6.2088, 106.8456], 10); // Default center: Jakarta

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
    /* 📡 FETCH & LOAD MARKERS FROM SUPABASE */
    /* ───────────────────────────────────── */

    try {
        console.log("Fetching locations from Supabase...");
        const locations = await fetchLocations();
        console.log("Locations received:", locations);

        locations.forEach((location) => {
            if (!location.geom || location.geom.type !== "Point") return;

            // ✅ Extract lat/lng from GeoJSON
            let [lng, lat] = location.geom.coordinates;

            // ✅ Add marker to the map
            let marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
            marker.bindPopup(`
                <b>${location["Nama Lokasi"]}</b><br>
                🏢 <b>Company:</b> ${location["Pemegang Wilus"]}<br>
                ⚡ <b>PLN UID:</b> ${location.UID}<br>
                📍 <b>Coordinates:</b> ${lat}, ${lng}
            `);
        });

        console.log("Markers added:", locations);
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
