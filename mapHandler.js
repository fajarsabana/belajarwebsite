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
        let place = location["Nama Lokasi"];

        if (!groupedData[company]) {
            groupedData[company] = [];
        }
        groupedData[company].push(location);
    });

    // ✅ Populate Sidebar & Map
    for (const company in groupedData) {
        let companyItem = document.createElement("li");
        companyItem.classList.add("parent-item");
        companyItem.textContent = company;

        let sublist = document.createElement("ul");
        sublist.classList.add("sublist");

        groupedData[company].forEach((location) => {
            let subItem = document.createElement("li");
            subItem.textContent = location["Nama Lokasi"];

            let shape; // Store either marker or polygon
            
            if (location.geom && location.geom.type === "Point") {  
                let [lng, lat] = location.geom.coordinates;
                shape = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                shape.bindPopup(`<b>${location["Nama Lokasi"]}</b><br>🏢 ${company}`);
            } 
            else if (location.geom && location.geom.type === "Polygon" && Array.isArray(location.geom.coordinates) && location.geom.coordinates.length > 0) {  
                let polygonCoordinates = location.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
                
                shape = L.polygon(polygonCoordinates, {
                    color: "#0077b6",  
                    fillColor: "#0096c7",
                    fillOpacity: 0.4,  
                    weight: 2
                }).addTo(map);
                shape.bindPopup(`<b>${location["Nama Lokasi"]}</b><br>🏢 ${company}`);
            }



            // ✅ Click to Zoom into Shape
            // ✅ Click to Zoom into Shape
        subItem.addEventListener("click", function () {
            console.log("📍 Sidebar item clicked:", location["Nama Lokasi"], location.geom);
            if (location.geom && location.geom.type === "Point") {
                console.log("Zooming to Point:", location["Nama Lokasi"], location.geom.coordinates);
                map.setView([location.geom.coordinates[1], location.geom.coordinates[0]], 14); // Ensure correct order
            } 
            else if (location.geom && location.geom.type === "Polygon" 
            && Array.isArray(location.geom.coordinates) 
            && location.geom.coordinates.length > 0 
            && Array.isArray(location.geom.coordinates[0])) {  // ✅ Ensures valid polygon coordinates
            
            console.log("Zooming to Polygon:", location["Nama Lokasi"], location.geom.coordinates);
            
            let bounds = L.latLngBounds(location.geom.coordinates[0].map(coord => [coord[1], coord[0]]));
            map.fitBounds(bounds);
        }
            else {
                console.warn("No valid geometry for:", location["Nama Lokasi"]);
            }
        });


            sublist.appendChild(subItem);
        });

        companyItem.appendChild(sublist);
        sidebar.appendChild(companyItem);

               companyItem.addEventListener("click", function (event) {
            if (event.target === this) {
                console.log("📂 Toggling company list for:", company);
                this.classList.toggle("open");
        
                // ✅ Find the corresponding sublist and toggle visibility
                let sublist = this.querySelector(".sublist");
                if (sublist) {
                    sublist.style.display = sublist.style.display === "none" ? "block" : "none";
                }
            }
        });


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

// ✅ Setup Map with Sidebar & Data
export async function setupMap() {
    const map = initializeMap();
    await loadMapAndSidebar(map);
    enableDoubleClickMarker(map);
}
