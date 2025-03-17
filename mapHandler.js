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

document.addEventListener("DOMContentLoaded", function () {
    const checkButton = document.getElementById("checkCoordinateBtn");

    if (checkButton) {
        checkButton.addEventListener("click", function () {
            const lat = parseFloat(document.getElementById("latInput").value);
            const lng = parseFloat(document.getElementById("lngInput").value);
            const resultBox = document.getElementById("coordinateResult");

            if (isNaN(lat) || isNaN(lng)) {
                resultBox.textContent = "❌ Please enter valid coordinates.";
                resultBox.style.color = "red";
                return;
            }

            console.log(`Checking coordinates: Latitude ${lat}, Longitude ${lng}`);

            // ✅ Loop through existing polygons to check if point is inside
            let isInside = false;
            map.eachLayer((layer) => {
                if (layer instanceof L.Polygon) {
                    if (layer.getBounds().contains([lat, lng])) {
                        isInside = true;
                    }
                }
            });

            // ✅ Display the result
            if (isInside) {
                resultBox.textContent = "✅ The coordinate is inside the mapped area!";
                resultBox.style.color = "limegreen";
            } else {
                resultBox.textContent = "❌ The coordinate is outside the mapped area.";
                resultBox.style.color = "red";
            }

            // ✅ Optional: Add a temporary marker at the inputted coordinate
            L.marker([lat, lng], { icon: customIcon }).addTo(map)
                .bindPopup(`📍 Checked Location:<br>Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
        });
    }
});


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

function filterSidebar() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let companies = document.querySelectorAll("#sidebar .parent-item"); // ✅ Correctly selects companies
    let locations = document.querySelectorAll("#sidebar .sublist li"); // ✅ Correctly selects locations

    let anyMatch = false; // Check if any result is found

    // ✅ Loop through companies (Pemegang Wilus)
    companies.forEach((companyItem) => {
        let companyName = companyItem.textContent.toLowerCase();
        let sublist = companyItem.nextElementSibling; // The <ul> sublist
        let hasVisibleLocation = false; // Track if any child matches

        // ✅ Loop through locations inside each company
        if (sublist) {
            let subItems = sublist.querySelectorAll("li");
            subItems.forEach((location) => {
                let locationName = location.textContent.toLowerCase();
                
                // ✅ If location matches, show it
                if (locationName.includes(input) || companyName.includes(input)) {
                    location.style.display = "block";
                    hasVisibleLocation = true;
                } else {
                    location.style.display = "none";
                }
            });
        }

        // ✅ Show the company if:
        // - The company name matches the search OR
        // - Any of its locations are visible
        if (companyName.includes(input) || hasVisibleLocation) {
            companyItem.style.display = "block";
            if (sublist) sublist.style.display = "block"; // Keep expanded
            anyMatch = true;
        } else {
            companyItem.style.display = "none";
            if (sublist) sublist.style.display = "none"; // Hide empty groups
        }
    });

    // ✅ If no results, display "No matches found" message
    let sidebar = document.querySelector("#sidebar ul"); // ✅ Corrected selector
    let noResults = document.getElementById("noResults");

    if (!anyMatch) {
        if (!noResults) {
            noResults = document.createElement("li");
            noResults.id = "noResults";
            noResults.textContent = "No matches found";
            noResults.style.color = "white";
            sidebar.appendChild(noResults);
        }
    } else if (noResults) {
        noResults.remove();
    }
}



// ✅ Setup Map with Sidebar & Data
export async function setupMap() {
    if (!window.map) {
        window.map = initializeMap();  // ✅ Store map globally
    }
    await loadMapAndSidebar(window.map);
    enableDoubleClickMarker(window.map);
}



document.addEventListener("DOMContentLoaded", function () {
    const checkButton = document.getElementById("checkCoordinateBtn");

    if (checkButton) {
        checkButton.addEventListener("click", function () {
            const lat = parseFloat(document.getElementById("latInput").value);
            const lng = parseFloat(document.getElementById("lngInput").value);
            const resultBox = document.getElementById("coordinateResult");

            if (isNaN(lat) || isNaN(lng)) {
                resultBox.textContent = "❌ Please enter valid coordinates.";
                resultBox.style.color = "red";
                return;
            }

            console.log(`Checking coordinates: Latitude ${lat}, Longitude ${lng}`);

            // ✅ Ensure `window.map` is initialized
            if (!window.map || typeof window.map.eachLayer !== "function") {
                console.error("❌ Map is not initialized or invalid.");
                resultBox.textContent = "❌ Map is not ready!";
                resultBox.style.color = "red";
                return;
            }

            let isInside = false;
            window.map.eachLayer((layer) => {
                if (layer instanceof L.Polygon) {
                    if (layer.getBounds().contains([lat, lng])) {
                        isInside = true;
                    }
                }
            });

            // ✅ Display the result
            if (isInside) {
                resultBox.textContent = "✅ The coordinate is inside the mapped area!";
                resultBox.style.color = "limegreen";
            } else {
                resultBox.textContent = "❌ The coordinate is outside the mapped area.";
                resultBox.style.color = "red";
            }

            // ✅ Optional: Add a temporary marker at the inputted coordinate
            L.marker([lat, lng], { icon: customIcon }).addTo(window.map)
                .bindPopup(`📍 Checked Location:<br>Lat: ${lat}, Lng: ${lng}`)
                .openPopup();
        });
    }

    // ✅ Sidebar Resize Function
    const sidebar = document.getElementById("sidebar");
    const resizeHandle = document.getElementById("resize-handle");

    let isResizing = false;

    resizeHandle.addEventListener("mousedown", (event) => {
        isResizing = true;
        document.body.style.cursor = "ew-resize";
        event.preventDefault();
    });

    document.addEventListener("mousemove", (event) => {
        if (!isResizing) return;
        let newWidth = event.clientX; // Get cursor X position
        if (newWidth > 200 && newWidth < 500) { // ✅ Keep within min/max limits
            sidebar.style.width = newWidth + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
        document.body.style.cursor = "default";
    });
});


