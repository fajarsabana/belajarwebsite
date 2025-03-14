import { fetchLocations } from "./supabase.js"; // Import Supabase function

document.addEventListener("DOMContentLoaded", async function () {
    // Check if the map is already initialized
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
    }).setView([-6.2088, 106.8456], 10);

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

    let activeMarker = null;

    // ✅ Add Marker on Click & Zoom
    map.on("click", function (e) {
        let lat = e.latlng.lat;
        let lng = e.latlng.lng;

        if (activeMarker) {
            map.removeLayer(activeMarker);
        }

        activeMarker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        activeMarker.bindPopup(
            `📍 You clicked here:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
        ).openPopup();

        map.setView([lat, lng], 14);
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 500);

    // ✅ Handle Click on Parent Items to Toggle Sublist
    document.querySelectorAll(".parent-item").forEach((item) => {
        item.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    });

    // ✅ Fetch and Add Markers from Supabase
    try {
        const locations = await fetchLocations();

        locations.forEach((location) => {
            if (!location.geom) return;

            let [lat, lng] = location.geom.split(",").map((coord) => parseFloat(coord.trim()));

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
});
